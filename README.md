## Environment Variables

Below are the configuration settings used by the file-sharing API:

### `PROVIDER`

- **Description**: Defines the storage provider to use for file uploads.
- **Possible values**:
  - `local`: Use local storage (files will be stored in the server's filesystem).
  - `google`: Use Google Cloud Storage (requires Google Cloud credentials and configuration).
- **Default**: `local`

### `CONFIG`

- **Description**: Path to the Google Cloud Storage configuration file.
- **Usage**: Only required if `PROVIDER=google`.
- **Example**:
  - `D:\projects\file-sharing-api/googleCloudConfig.json`

### `PORT`

- **Description**: The port on which the server will run.
- **Default**: `3000`
- **Example**:
  - `PORT=3000`

### `FOLDER`

- **Description**: Path to the local folder where files are stored (used when `PROVIDER=local`).
- **Usage**: The folder must exist, and the server must have read/write permissions.
- **Example**:
  - `D:\projects\file-sharing-api\uploads`

### `UPLOAD_LIMIT`

- **Description**: Maximum file upload size.
- **Default**: `10GB`
- **Usage**: Used to limit the size of uploaded files. Should be formatted as a number with a unit (e.g., `10GB`, `5MB`).
- **Example**:
  - `UPLOAD_LIMIT=10GB`

### `DOWNLOAD_LIMIT`

- **Description**: Maximum file download size.
- **Default**: `10GB`
- **Usage**: Used to limit the size of files being downloaded. Should be formatted as a number with a unit (e.g., `10GB`, `5MB`).
- **Example**:
  - `DOWNLOAD_LIMIT=10GB`

### `INACTIVITY_PERIOD`

- **Description**: Defines the inactivity period after which files will be deleted (if older than this period).
- **Default**: `7Days`
- **Usage**: This value determines how long a file remains inactive before being cleaned up.
- **Example**:
  - `INACTIVITY_PERIOD=1Day`

### `CLEANUP_CRON_SCHEDULE`

- **Description**: Cron schedule expression for the cleanup task.
- **Default**: `*/1 * * * *` (runs every minute).
- **Usage**: This cron expression defines how often the cleanup task should run to remove old files.
- **Example**:
  - `CLEANUP_CRON_SCHEDULE="*/1 * * * *"`

---

Make sure to configure these environment variables in your `.env` file or directly in your server environment to match your setup and requirements.
