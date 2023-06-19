# syntax=docker/dockerfile:1

FROM python:3.10-alpine as python-base

ENV PYTHONUNBUFFERED=1 \
	PYTHONDONTWRITEBYTECODE=1 \
	PIP_NO_CACHE_DIR=off \
	PIP_DISABLE_PIP_VERSION_CHECK=on \
	PIP_DEFAULT_TIMEOUT=100 \
	POETRY_VERSION=1.5.0 \
	POETRY_HOME="/opt/poetry" \
	POETRY_VIRTUALENVS_IN_PROJECT=true \
	POETRY_NO_INTERACTION=1 \
	PYSETUP_PATH="/opt/pysetup" \
	VENV_PATH="/opt/pysetup/.venv"

ENV PATH="$POETRY_HOME/bin:$VENV_PATH/bin:$PATH"


FROM python-base as builder-base

RUN apk add --no-cache curl build-base linux-headers

WORKDIR $PYSETUP_PATH
RUN curl -sSL https://install.python-poetry.org | python -

COPY ./poetry.lock ./pyproject.toml ./
RUN poetry install --without=dev


# NOTE: Untested
# FROM python-base as development
# ENV FASTAPI_ENV=development
# WORKDIR $PYSETUP_PATH

# COPY --from=builder-base $POETRY_HOME $POETRY_HOME
# COPY --from=builder-base $PYSETUP_PATH $PYSETUP_PATH

# RUN --mount=type=cache,target=/root/.cache \
#     poetry install --with=dev

# WORKDIR /app

# CMD ["sh", "-c", "uvicorn --reload api.main:app --host 0.0.0.0 --port $API_PORT"]


FROM python-base as production
ENV FASTAPI_ENV=production

COPY --from=builder-base $PYSETUP_PATH $PYSETUP_PATH
COPY ./api/ /app/api
WORKDIR /app
CMD ["sh", "-c", "uvicorn api.main:app --host 0.0.0.0 --port $PORT"]
