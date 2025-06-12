# Debugging Django Project in VSCode

This project is configured for debugging Django using VSCode.

## Prerequisites

- Ensure you have Python and Django installed in your environment.
- Redis server should be running if you are using Django Channels.

## Debug Configuration

The `.vscode/launch.json` file contains debug configurations for Django:

- **Python Debugger: Django** - Launches the Django development server with debugging enabled.
- **Python: Django** - Alternative launch configuration.
- **Python: Django (Attach)** - Attach to a running Django process.

## How to Debug

1. Open this project in VSCode.
2. Open the Debug panel (Ctrl+Shift+D).
3. Select the desired debug configuration (e.g., "Python Debugger: Django").
4. Set breakpoints in your Django app code (e.g., views, consumers).
5. Start debugging by clicking the green play button.
6. The Django development server will start, and VSCode will attach the debugger.
7. Use the debug console and step through your code as needed.

## Notes

- The `DEBUG` setting in `videochat/settings.py` is set to `True` for debugging.
- Make sure your Redis server is running if you use Channels.
- Static files and templates are configured properly.

This setup allows you to debug your Django application efficiently within VSCode.
