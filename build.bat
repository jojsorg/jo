@echo off
if exist build.bat goto start
goto wrongdir

:start
echo "Building js\jo.js"

cd js\core
copy log.js + _jo.js + dom.js + event.js + subject.js + time.js + yield.js + cache.js + clipboard.js + local.js ..\jo_core.js

cd ..\data
copy datasource.js + record.js + database.js + filesource.js + sqldatasource.js + script.js + preference.js + yql.js + dispatch.js ..\jo_data.js

cd ..\ui
copy collect.js + interface.js + view.js + container.js + control.js + button.js + list.js + busy.js + caption.js + card.js + stack.js + scroller.js + divider.js + expando.js + expandotitle.js + flexrow.js + focus.js + footer.js + gesture.js + group.js + html.js + input.js + label.js + menu.js + option.js + passwordinput.js + popup.js + screen.js + shim.js + sound.js + stackscroller.js + tabbar.js + table.js + textarea.js + title.js + toolbar.js + form.js + dialog.js + selectlist.js + navbar.js + select.js + toggle.js + slider.js ..\jo_ui.js

cd ..

copy jo_core.js + jo_data.js + jo_ui.js jo.js
del jo_core.js
del jo_data.js
del jo_ui.js

for %%J in (jsmin.exe) do set JSMIN=%%~dp$PATH:Jjsmin.exe
if not "%JSMIN%"=="" goto minify
echo "jsmin not found, skipping minification."
cd ..
goto end

:minify
echo "Minifying js\jo.js -> js\jo_min.js"
%JSMIN% < jo.js > jo_min.js
cd ..
goto end

:wrongdir
echo "OOPS: Run this batch file from the jo source directory, i.e. cd jo first."
goto end

:end
echo "Done."
