@rem
@rem Copyright 2015 the original author or authors.
@rem
@rem Licensed under the Apache License, Version 2.0 (the "License");
@rem you may not use this file except in compliance with the License.
@rem You may obtain a copy of the License at
@rem
@rem      https://www.apache.org/licenses/LICENSE-2.0
@rem
@rem Unless required by applicable law or agreed to in writing, software
@rem distributed under the License is distributed on an "AS IS" BASIS,
@rem WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
@rem See the License for the specific language governing permissions and
@rem limitations under the License.
@rem
@rem SPDX-License-Identifier: Apache-2.0
@rem

@if "%DEBUG%"=="" @echo off
@rem ##########################################################################
@rem
@rem  kudejasper startup script for Windows
@rem
@rem ##########################################################################

@rem Set local scope for the variables with windows NT shell
if "%OS%"=="Windows_NT" setlocal

set DIRNAME=%~dp0
if "%DIRNAME%"=="" set DIRNAME=.
@rem This is normally unused
set APP_BASE_NAME=%~n0
set APP_HOME=%DIRNAME%..

@rem Resolve any "." and ".." in APP_HOME to make it shorter.
for %%i in ("%APP_HOME%") do set APP_HOME=%%~fi

@rem Add default JVM options here. You can also use JAVA_OPTS and KUDEJASPER_OPTS to pass JVM options to this script.
set DEFAULT_JVM_OPTS=

@rem Find java.exe
if defined JAVA_HOME goto findJavaFromJavaHome

set JAVA_EXE=java.exe
%JAVA_EXE% -version >NUL 2>&1
if %ERRORLEVEL% equ 0 goto execute

echo. 1>&2
echo ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH. 1>&2
echo. 1>&2
echo Please set the JAVA_HOME variable in your environment to match the 1>&2
echo location of your Java installation. 1>&2

goto fail

:findJavaFromJavaHome
set JAVA_HOME=%JAVA_HOME:"=%
set JAVA_EXE=%JAVA_HOME%/bin/java.exe

if exist "%JAVA_EXE%" goto execute

echo. 1>&2
echo ERROR: JAVA_HOME is set to an invalid directory: %JAVA_HOME% 1>&2
echo. 1>&2
echo Please set the JAVA_HOME variable in your environment to match the 1>&2
echo location of your Java installation. 1>&2

goto fail

:execute
@rem Setup the command line

set CLASSPATH=%APP_HOME%\lib\kudejasper-1.0.0.jar;%APP_HOME%\lib\guava-33.2.1-jre.jar;%APP_HOME%\lib\gson-2.11.0.jar;%APP_HOME%\lib\jasperreports-pdf-7.0.1.jar;%APP_HOME%\lib\jasperreports-jaxen-7.0.1.jar;%APP_HOME%\lib\jasperreports-7.0.1.jar;%APP_HOME%\lib\javase-3.5.3.jar;%APP_HOME%\lib\jasperreports-fonts-7.0.1.jar;%APP_HOME%\lib\failureaccess-1.0.2.jar;%APP_HOME%\lib\listenablefuture-9999.0-empty-to-avoid-conflict-with-guava.jar;%APP_HOME%\lib\jsr305-3.0.2.jar;%APP_HOME%\lib\checker-qual-3.42.0.jar;%APP_HOME%\lib\error_prone_annotations-2.27.0.jar;%APP_HOME%\lib\commons-beanutils-1.9.4.jar;%APP_HOME%\lib\batik-bridge-1.17.jar;%APP_HOME%\lib\batik-script-1.17.jar;%APP_HOME%\lib\batik-anim-1.17.jar;%APP_HOME%\lib\batik-svg-dom-1.17.jar;%APP_HOME%\lib\batik-gvt-1.17.jar;%APP_HOME%\lib\batik-parser-1.17.jar;%APP_HOME%\lib\batik-awt-util-1.17.jar;%APP_HOME%\lib\batik-dom-1.17.jar;%APP_HOME%\lib\batik-css-1.17.jar;%APP_HOME%\lib\xmlgraphics-commons-2.9.jar;%APP_HOME%\lib\commons-logging-1.3.0.jar;%APP_HOME%\lib\commons-collections4-4.4.jar;%APP_HOME%\lib\jackson-annotations-2.17.1.jar;%APP_HOME%\lib\jackson-dataformat-xml-2.17.1.jar;%APP_HOME%\lib\jackson-databind-2.17.1.jar;%APP_HOME%\lib\jackson-core-2.17.1.jar;%APP_HOME%\lib\batik-xml-1.17.jar;%APP_HOME%\lib\batik-util-1.17.jar;%APP_HOME%\lib\batik-constants-1.17.jar;%APP_HOME%\lib\xml-apis-ext-1.3.04.jar;%APP_HOME%\lib\core-3.5.3.jar;%APP_HOME%\lib\jcommander-1.82.jar;%APP_HOME%\lib\jai-imageio-core-1.4.0.jar;%APP_HOME%\lib\openpdf-1.3.32.jar;%APP_HOME%\lib\xmpcore-6.1.11.jar;%APP_HOME%\lib\jaxen-2.0.0.jar;%APP_HOME%\lib\woodstox-core-6.6.2.jar;%APP_HOME%\lib\stax2-api-4.2.2.jar;%APP_HOME%\lib\batik-ext-1.17.jar;%APP_HOME%\lib\batik-i18n-1.17.jar;%APP_HOME%\lib\batik-shared-resources-1.17.jar;%APP_HOME%\lib\xml-apis-1.4.01.jar;%APP_HOME%\lib\commons-collections-3.2.2.jar;%APP_HOME%\lib\commons-io-2.11.0.jar


@rem Execute kudejasper
"%JAVA_EXE%" %DEFAULT_JVM_OPTS% %JAVA_OPTS% %KUDEJASPER_OPTS%  -classpath "%CLASSPATH%" com.traver.kudejasper.App %*

:end
@rem End local scope for the variables with windows NT shell
if %ERRORLEVEL% equ 0 goto mainEnd

:fail
rem Set variable KUDEJASPER_EXIT_CONSOLE if you need the _script_ return code instead of
rem the _cmd.exe /c_ return code!
set EXIT_CODE=%ERRORLEVEL%
if %EXIT_CODE% equ 0 set EXIT_CODE=1
if not ""=="%KUDEJASPER_EXIT_CONSOLE%" exit %EXIT_CODE%
exit /b %EXIT_CODE%

:mainEnd
if "%OS%"=="Windows_NT" endlocal

:omega
