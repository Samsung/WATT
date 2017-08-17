# Contributing guidelines

### Contributing code
If you have improvements to WATT, send us your pull requests! For those just getting started, Github has a [howto](https://help.github.com/articles/using-pull-requests/).

If you want to contribute but you're not sure where to start, take a look at the issues with the "contributions welcome" label. These are issues that we believe are particularly well suited for outside contributions, often because we probably won't get to them right now. If you decide to start on an issue, leave a comment so that other people know that you're working on it. If you want to help out, but not alone, use the issue comment thread to coordinate.

### Commit policy
We recommend that use a 1 commit for the pull request. If you want to upload many commits in the same pull request, you have to squash or amend your commits before merging it.

### Commit message
You should add following content to your commit message:
- Title
- Description
- Signed off (You can add the signed-off using git '-s' option)

- Example
```
  WATT patch

  This is example patch for the WATT

  Signed-off-by: WATT <watt@samsung.com>
```

It would be good to comment when the commit is related to known issue.


### Coding styles
We have to abide by the following coding styles:
- Node: [Node-style-guide](https://github.com/felixge/node-style-guide)
- Brackets: [Brackets-Coding-Conventions](https://github.com/adobe/brackets/wiki/Brackets-Coding-Conventions)

We recommend to run "grunt check" before uploading a pull request.

### Review policy
To merge your pull request, you have to get approved by reviewers.

##### Reviewers:
KwangHyuk Kim (hyuki.kim@samsung.com),
SangYong Park (sy302.park@samsung.com),
Hyunduk Kim (hyunduk.kim@samsung.com),
Grzegorz Wolny (g.wolny@samsung.com),
Grzegorz Czajkowski (g.czajkowski@samsung.com),
Lukasz Slachciak (l.slachciak@samsung.com),
