# Android release tools

`bundletool.jar` is the pinned Bundletool 1.18.2 binary used to validate the
locally signed Play App Bundle. It is kept here so release checks do not depend
on an unpinned global installation.

```powershell
java -jar tools/android/bundletool.jar validate `
  --bundle=android/app/build/outputs/bundle/release/app-release.aab
```

Update the binary only together with a successful release validation and an
update to this version note.
