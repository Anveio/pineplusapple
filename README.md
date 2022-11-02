# Pine + Apple

**Production website**: pineplusapple.com

Staging website: staging.pineplusapple.com

## Development

Clone the repo:

```
git clone git@github.com:Anveio/pineplusapple.git
```

`cd` Into the folder containing the repository contents

```
cd ./pineplusapple
```

<details>
<summary>Installing Node & NPM (if you don't have it already)</summary>
Install node via node version manager (nvm):

Install nvm first:

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash
```

or

```
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash
```

Add it to your path so you can run `nvm` by adding the below contents to your `~/.zshrc, ~/.profile, ~/.bash_profile, or ~/.bashrc` file:

```
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

Also run the above command in your currently open terminal, restart your terminal, or source your latest terminal profile file before continuing.

Install the version 18 of node:

```
nvm install 18
nvm use 18
nvm alias default 18
```

</details>

Do the above Node and NPM setup instructions if you haven't yet. Otherwise, install NPM dependencies:

```
npm install
```

Apply database migrations:

```
npm run setup
```

<details>
<summary>Installing and starting Docker if you haven't already</summary>
Go to https://docs.docker.com/compose/install/ and follow the install instructions for your OS

After you finish installing it, ensure docker is running (either by running the application from the Applications or running )

Start the docker daemon:

```
service docker start
```

or

```
systemctl start docker
```

Start docker-compose:

```
docker-compose up
```

</details>

Do the above "Installing and starting Docker" section above if you don't have Docker set up. Otherwise, Start the database and seed it with some test data:

```
npm run docker
```

Generate the server-side JS code and initial CSS, HTML, and client-side JS files:

```
npm run build
```

Create a local test `.env` file so it's picked up by server-side code.

```
cp ./env.example ./env
```

Start the dev server:

```
npm run dev
```

Run tests:

```
npm run test
```

Run end-to-end tests:

```
npm run test:e2e:dev
```
