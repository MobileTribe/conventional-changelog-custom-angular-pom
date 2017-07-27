# custom-angular-pom preset

This preset extends the [angular](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-angular) preset, and uses the data available in the `pom.xml` file of your project.

It is meant to be used with the [conventional-changelog-cli](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-cli) to generate a CHANGELOG from the command line.

## Installation

```sh
$ npm install -g conventional-changelog-cli conventional-changelog-custom-angular-pom
```

## Usage

```sh
$ conventional-changelog -p custom-angular-pom -r 0
```

Some commits can be ignored with the `CHANGELOG_IGNORE_BEFORE` parameter:

```sh
CHANGELOG_IGNORE_BEFORE=2017-01-01 conventional-changelog -p custom-angular-pom -r 0
```

### Example

```xml
<!-- pom.xml -->
<project
  xmlns="http://maven.apache.org/POM/4.0.0"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <!-- ... -->

  <version>0.0.3-SNAPSHOT</version>

  <scm>
    <url>https://gitlab.company.com/my-team/awesome-project.git</url>
  </scm>

  <issueManagement>
    <url>https://jira.company.com/projects/AWSP/issues</url>
  </issueManagement>
</project>
```

```sh
$ git log --decorate

commit b42be2d (HEAD -> master)

    feat(*): add new awesome feature

commit 14e2cf9 (tag: 0.0.2)

    fix(*): fix some thing

commit 0d655f4

    docs(*): write some doc

commit e106726 (tag: 0.0.1)

    feat(*): first commit

    Closes #1
    Closes #2
```

```sh
$ conventional-changelog -p custom-angular-pom -r 0
```

**Result:**

<a name="0.0.3-SNAPSHOT"></a>
# 0.0.3-SNAPSHOT (2017-01-03)


### Features

* add new awesome feature ([b42be2d](https://gitlab.company.com/my-team/awesome-project/commit/b42be2d))



<a name="0.0.2"></a>
## 0.0.2 (2017-01-02)


### Bug Fixes

* fix some thing ([14e2cf9](https://gitlab.company.com/my-team/awesome-project/commit/14e2cf9))



<a name="0.0.1"></a>
## 0.0.1 (2017-01-01)


### Features

* first commit ([e106726](https://gitlab.company.com/my-team/awesome-project/commit/e106726)), closes [#1](https://jira.company.com/projects/AWSP/issues/1) [#2](https://jira.company.com/projects/AWSP/issues/2)

## Partner

<img src="static/lm.jpg" alias="Leroy Merlin" width="120" height="120">

## License

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
