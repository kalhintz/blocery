// https://intellij-support.jetbrains.com/hc/en-us/community/posts/360002490579-Custom-import-paths-jsconfig-json

System.config({
    "paths": {
        "~/*": "./src/*",
        "$/*": "./src/contracts/*"
    }
});