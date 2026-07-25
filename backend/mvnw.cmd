@REM ----------------------------------------------------------------------------
@REM  Maven Wrapper startup batch script for Windows
@REM  Version 3.3.2
@REM ----------------------------------------------------------------------------

@setlocal

set MAVEN_PROJECTBASEDIR=%~dp0

set MAVEN_WRAPPER_PROPERTIES=%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.properties
@REM Read distributionUrl from properties file
set MAVEN_DIST_URL=
for /f "usebackq tokens=1,2 delims==" %%a in ("%MAVEN_WRAPPER_PROPERTIES%") do (
    if "%%a"=="distributionUrl" set MAVEN_DIST_URL=%%b
)

set MAVEN_WRAPPER_JAR=%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.jar

@REM Download wrapper JAR if missing
if not exist "%MAVEN_WRAPPER_JAR%" (
    echo Downloading Maven Wrapper JAR...
    set WRAPPER_URL=https://repo1.maven.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.3.2/maven-wrapper-3.3.2.jar
    powershell -Command "(New-Object Net.WebClient).DownloadFile('%WRAPPER_URL%', '%MAVEN_WRAPPER_JAR%')"
)

@REM Find or download Maven
if defined MAVEN_HOME (
    set MAVEN_CMD=%MAVEN_HOME%\bin\mvn.cmd
) else (
    where mvn >nul 2>&1
    if %ERRORLEVEL% equ 0 (
        set MAVEN_CMD=mvn
    ) else (
        if "%MAVEN_DIST_URL%"=="" (
            set MAVEN_DIST_URL=https://repo1.maven.org/maven2/org/apache/maven/apache-maven/3.9.9/apache-maven-3.9.9-bin.zip
        )
        set MAVEN_HOME=%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven
        if not exist "%MAVEN_HOME%\bin\mvn.cmd" (
            echo Downloading Maven...
            set TMPFILE=%TEMP%\maven-dist.zip
            powershell -Command "(New-Object Net.WebClient).DownloadFile('%MAVEN_DIST_URL%', '%TMPFILE%')"
            powershell -Command "Expand-Archive -Path '%TMPFILE%' -DestinationPath '%MAVEN_PROJECTBASEDIR%.mvn\wrapper' -Force"
            del "%TMPFILE%"
        )
        set MAVEN_CMD=%MAVEN_HOME%\bin\mvn.cmd
    )
)

@REM Execute Maven
"%MAVEN_CMD%" %*

@endlocal
