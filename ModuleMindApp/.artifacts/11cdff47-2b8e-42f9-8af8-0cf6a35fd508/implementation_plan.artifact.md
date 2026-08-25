# Fix Gradle Build Error: Unsupported class file major version 69

The build is failing because **Gradle 8.14.3** is attempting to run on **Java 25**, which it does not yet support (class file version 69 corresponds to Java 25). Gradle 8.14.3 supports up to Java 24.

Since your Android Studio environment is currently using Java 25, we need to point Gradle to a compatible JDK version. I have identified a **Java 17** installation on your system that can be used for the build.

## User Review Required

> [!IMPORTANT]
> This fix forces Gradle to use a specific JDK path on your local machine. If this path change is not desired for other developers on your team, you may want to consider downgrading your system's default Java version or updating your environment variables instead.

## Proposed Changes

### [Component Name] Android Build Configuration

#### [MODIFY] [gradle.properties](file:///C:/Users/samhy/Documents/GitHub/ModuleMind/ModuleMindApp/android/gradle.properties)
Add `org.gradle.java.home` to point to a compatible JDK.

```properties
# Force Gradle to use a compatible JDK (Java 17)
org.gradle.java.home=C:/Users/samhy/AppData/Local/essential-installer/wrapper-jre
```

## Verification Plan

### Manual Verification
1. Run `npx expo run:android` again in the terminal.
2. Verify that the build proceeds past the "semantic analysis" phase.
