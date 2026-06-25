# Deployment

The live site (`experiments.cwandt.com/codenames`, on the DreamHost VPS) is
kept in sync with `main` by `.github/workflows/deploy.yml`. Every push to
`main` rsyncs the app files to the VPS over SSH, so the live server always
matches `main`.

## One-time setup

1. **Create a deploy key** (no passphrase) on your machine:

   ```bash
   ssh-keygen -t ed25519 -f deploy_key -N "" -C "github-actions-codenames"
   ```

2. **Authorize it on the VPS** — append the public key to the deploy user's
   `~/.ssh/authorized_keys`:

   ```bash
   ssh-copy-id -i deploy_key.pub USER@experiments.cwandt.com
   # or paste the contents of deploy_key.pub into ~/.ssh/authorized_keys on the box
   ```

3. **Add repo secrets** (GitHub → Settings → Secrets and variables → Actions):

   | Secret           | Value                                                        |
   |------------------|--------------------------------------------------------------|
   | `DEPLOY_SSH_KEY` | full contents of the **private** `deploy_key` file           |
   | `DEPLOY_HOST`    | SSH host, e.g. `experiments.cwandt.com` or the VPS hostname   |
   | `DEPLOY_USER`    | SSH username on the VPS                                       |
   | `DEPLOY_PATH`    | absolute path to the live folder, e.g. `~/experiments.cwandt.com/codenames/` (keep the trailing slash) |
   | `DEPLOY_PORT`    | *(optional)* SSH port if not 22                              |

   Then delete the local `deploy_key`/`deploy_key.pub` files.

## Run it

- Automatic: push (or merge) to `main`.
- Manual / first run: GitHub → Actions → **Deploy to live server** → **Run workflow**.

`rsync --delete` makes the live `/codenames` folder mirror the repo exactly,
so anything not tracked in the repo (and not excluded above) will be removed
from that folder. Keep the folder dedicated to this app, or drop `--delete`
from the workflow for additive-only syncing.
