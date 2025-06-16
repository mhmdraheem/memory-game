@echo off
setlocal EnableDelayedExpansion

:: Set the output file name
set "output=filenames.txt"
:: Initialize line counter
set count=0

:: Count number of files
for %%F in (*.*) do (
    set /a count+=1
)

:: Write file names with quotes and commas
set /a current=0
> "%output%" (
    for %%F in (*.*) do (
        set /a current+=1
        set "line="%%F""
        if !current! lss %count% (
            echo !line!,
        ) else (
            echo !line!
        )
    )
)

:: Open in Notepad
notepad "%output%"
