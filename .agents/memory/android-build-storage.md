---
name: Android build storage
description: Workspace-specific constraints and workarounds for native Android builds.
---

Native Android builds can exhaust the container's quota-limited home/temp storage even when the workspace volume has ample free space. Keep the Android SDK and Gradle user home on the workspace volume for APK builds. The Java performance-data subsystem may also crash with SIGBUS in this environment; disabling shared performance data avoids that host-level failure.

**Why:** Gradle dependency transforms and native toolchain installation need several gigabytes, and the default cache locations are not on the large workspace volume.

**How to apply:** Before building Android, set `ANDROID_SDK_ROOT`, `ANDROID_HOME`, and `GRADLE_USER_HOME` to workspace-backed build-cache paths and use `JAVA_TOOL_OPTIONS=-XX:+PerfDisableSharedMem`.