'use strict';
var compareFunc = require('compare-func');
var gufg = require('github-url-from-git');
var readPkgUp = require('read-pkg-up');
var pomParser = require('pom-parser');
var Q = require('q');
var readFile = Q.denodeify(require('fs').readFile);
var resolve = require('path').resolve;
var url = require('url');

var parserOpts = {
  headerPattern: /^(\w*)(?:\((.*)\))?\: (.*)$/,
  headerCorrespondence: [
    'type',
    'scope',
    'subject'
  ],
  noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES'],
  revertPattern: /^revert:\s([\s\S]*?)\s*This reverts commit (\w*)\./,
  revertCorrespondence: ['header', 'hash']
};

var pom;

/**
 * Load the pom.xml file in the working directory
 */
var loadPom = Q.Promise(function(resolve, reject) {
  pomParser.parse({
    filePath: "pom.xml"
  }, function(err, pomResponse) {
    if (err) {
      reject(err);
    } else {
      pom = pomResponse.pomObject;
      resolve();
    }
  });
});

var ignoreBefore = process.env['CHANGELOG_IGNORE_BEFORE'];

if (ignoreBefore && !/\d{4}-\d{2}-\d{2}/.test(ignoreBefore)) {
  console.log("[WARN] the CHANGELOG_IGNORE_BEFORE parameter doesn't look like a valid date: [" + ignoreBefore + ']');
}

function issueUrl() {
  var pkg = readPkgUp.sync().pkg;

  if (pkg && pkg.repository && pkg.repository.url && ~pkg.repository.url.indexOf('github.com')) {
    var gitUrl = gufg(pkg.repository.url);

    if (gitUrl) {
      return gitUrl + '/issues/';
    }
  }
}

var writerOpts = {
  transform: function(commit) {
    var discard = true;
    var issues = [];

    if (ignoreBefore && commit.committerDate < ignoreBefore) {
      return;
    }

    commit.notes.forEach(function(note) {
      note.title = 'BREAKING CHANGES';
      discard = false;
    });

    if (commit.type === 'feat') {
      commit.type = 'Features';
    } else if (commit.type === 'fix') {
      commit.type = 'Bug Fixes';
    } else if (commit.type === 'perf') {
      commit.type = 'Performance Improvements';
    } else if (commit.type === 'revert') {
      commit.type = 'Reverts';
    } else if (discard) {
      return;
    } else if (commit.type === 'docs') {
      commit.type = 'Documentation';
    } else if (commit.type === 'style') {
      commit.type = 'Styles';
    } else if (commit.type === 'refactor') {
      commit.type = 'Code Refactoring';
    } else if (commit.type === 'test') {
      commit.type = 'Tests';
    } else if (commit.type === 'chore') {
      commit.type = 'Chores';
    }

    if (commit.scope === '*') {
      commit.scope = '';
    }

    if (typeof commit.hash === 'string') {
      commit.hash = commit.hash.substring(0, 7);
    }

    if (typeof commit.subject === 'string') {
      var url = issueUrl();
      if (url) {
        // GitHub issue URLs.
        commit.subject = commit.subject.replace(/#([0-9]+)/g, function(_, issue) {
          issues.push(issue);
          return '[#' + issue + '](' + url + issue + ')';
        });
      }
      // GitHub user URLs.
      commit.subject = commit.subject.replace(/@([a-zA-Z0-9_]+)/g, '[@$1](https://github.com/$1)');
      commit.subject = commit.subject;
    }

    // remove references that already appear in the subject
    commit.references = commit.references.filter(function(reference) {
      return issues.indexOf(reference.issue) === -1;
    });

    // use the <issueManagement> data if available
    if (pom.project.issuemanagement && pom.project.issuemanagement.url) {
      commit.references.map(function(reference) {
        reference.repository = pom.project.issuemanagement.url;
      });
    }

    return commit;
  },
  groupBy: 'type',
  commitGroupsSort: 'title',
  commitsSort: ['scope', 'subject'],
  noteGroupsSort: 'title',
  notesSort: compareFunc,

  finalizeContext: function (context) {

    // use the <scm> data if available
    if (pom.project.scm && pom.project.scm.url) {
      let parsed = url.parse(pom.project.scm.url);
      context.host = parsed.protocol + '//' + parsed.host;
    }

    // use the current version for snapshots
    if (!context.version) {
      context.version = pom.project.version;
    }

    return context;
  }
};

module.exports = Q.all([
  readFile(resolve(__dirname, 'templates/template.hbs'), 'utf-8'),
  readFile(resolve(__dirname, 'templates/header.hbs'), 'utf-8'),
  readFile(resolve(__dirname, 'templates/commit.hbs'), 'utf-8'),
  readFile(resolve(__dirname, 'templates/footer.hbs'), 'utf-8'),
  loadPom
])
  .spread(function(template, header, commit, footer) {

    writerOpts.mainTemplate = template;
    writerOpts.headerPartial = header;
    writerOpts.commitPartial = commit;
    writerOpts.footerPartial = footer;

    return {
      parserOpts: parserOpts,
      writerOpts: writerOpts
    };
  });
