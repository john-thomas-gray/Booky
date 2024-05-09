# Booky

## Team

John Gray
Vinny Vitiritto
Judah Viggers
Tyler Primavera

## Install Extensions

-   Prettier: <https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode>
-   Black Formatter: <https://marketplace.visualstudio.com/items?itemName=ms-python.black-formatter>

## Deliverables

-   Wire-frame diagrams
    ![alt text](image.png)

![alt text](image-1.png)

![alt text](image-2.png)

![alt text](image-3.png)

-   [API documentation] (README_APIDOCS.md)
-   Project is deployed to PostgreSQL (BE, DB) & GitLab-pages (FE)

## Project layout

The layout of the project is just like all of the projects
you did with `docker-compose` in module #2. You will create
a directory in the root of the repository for each service
that you add to your project just like those previous
projects were setup.

### Directories

Several directories have been added to your project. The
directories `docs` and `journals` are places for you and
your team-mates to, respectively, put any documentation
about your project that you create and to put your
project-journal entries. See the _README.md_ file in each
directory for more info.

The other directories, `ghi` and `api`, are services, that
you can start building off of.

Inside of `ghi` is a minimal React app that has an "under construction" page.
This app is written using the [Vite](https://vitejs.dev/) bundler. The example
code is also using [jsdoc](https://jsdoc.app/) to provide type hints for
JavaScript. You are not required to use JSDoc yourself, and you will be removing
these examples and providing your own code for `App.jsx`

Inside of `api` is a minimal FastAPI application.
"Where are all the files?" you might ask? Well, the
`main.py` file is the whole thing, and go take look inside
of it... There's not even much in there..., hmm? That is
FastAPI, we'll learn more about it in the coming days. Can
you figure out what this little web-application does even
though you haven't learned about FastAPI yet?

Also in `api` is a directory for your migrations.
If you choose to use PostgreSQL, then you'll want to use
migrations to control your database. Unlike Django, where
migrations were automatically created for you, you'll write
yours by hand using DDL. Don't worry about not knowing what
DDL means; we have you covered. There's a sample migration
in there that creates two tables so you can see what they
look like.

The Dockerfile and Dockerfile.dev run your migrations
for you automatically.

### Other files

The following project files have been created as a minimal
starting point. Please follow the guidance for each one for
a most successful project.

-   `docker-compose.yaml`: there isn't much in here, just a
    **really** simple UI and FastAPI service. Add services
    (like a database) to this file as you did with previous
    projects in module #2.
-   `.gitlab-ci.yml`: This is your "ci/cd" file where you will
    configure automated unit tests, code quality checks, and
    the building and deployment of your production system.
    Currently, all it does is deploy an "under construction"
    page to your production UI on GitLab and a sample backend
    to CapRover. We will learn much more about this file.
-   `.gitignore`: This is a file that prevents unwanted files
    from getting added to your repository, files like
    `pyc` files, `__pycache__`, etc. We've set it up so that
    it has a good default configuration for Python projects.
-   `.env.sample`: This file is a template to copy when
    creating environment variables for your team. Create a
    copy called `.env` and put your own passwords in here
    without fear of it being committed to git (see `.env`
    listed in `.gitignore`). You can also put team related
    environment variables in here, things like api and signing
    keys that shouldn't be committed; these should be
    duplicated in your deployed environments.

### Installing python dependencies locally

In order for VSCode's built in code completion and intelligence to
work correctly, it needs the dependencies from the requirements.txt file
installed. We do this inside docker, but not in the workspace.

So we need to create a virtual environment and pip install the requirements.

From inside the `api` folder:

```bash
python -m venv .venv
```

Then activate the virtual environment

```bash
source .venv/bin/activate
```

And finally install the dependencies

```bash
pip install -r requirements.txt
```

Then make sure the venv is selected in VSCode by checking the lower right of the
VSCode status bar

### Setup GitLab repo/project

-   make sure this project is in a group. If it isn't, stop
    now and move it to a GitLab group
-   remove the fork relationship: In GitLab go to:

    Settings -> General -> Advanced -> Remove fork relationship

-   add these GitLab CI/CD variables:
    -   PUBLIC_URL : this is your gitlab pages URL
    -   VITE_APP_API_HOST: enter "blank" for now

#### Your GitLab pages URL

You can't find this in GitLab until after you've done a deploy
but you can figure it out yourself from your GitLab project URL.

If this is your project URL

https://gitlab.com/GROUP_NAME/PROJECT_NAME

then your GitLab pages URL will be

https://GROUP_NAME.gitlab.io/PROJECT_NAME
