#!/bin/bash

set -euo pipefail

ENGINE="podman"
REGISTRY="ghcr.io"
PLATFORM="linux/amd64"
ARCH=""
TAG_SUFFIX=""
USERNAME=""
IMG_NAME=""
BUILD_MODE="production"
PUSH_BUILD=false
MULTIARCH=false
REV_LENGTH=7

if ! command -v jq &>/dev/null; then
  echo "Error: jq is required to parse package.json but not found."
  exit 1
fi

function usage() {
  cat <<EOF
Usage: $0 [options]

Builds the image locally by default. Add --push to publish it. The image
is built for the host platform unless --arch or --multiarch is given.

Options:
  -n, --image-name=IMAGE  Specify image name (default from package.json)
  -U, --user=USERNAME     Container registry username (required)
  -m, --mode              Build mode (default: "production")
  -p, --push              Push built image(s) to the registry
  -D, --docker            Use docker instead of podman
  --registry=REGISTRY     Container registry hostname (default: ghcr.io)
  --arch=ARCH             Target architecture: amd64, arm64, or linux/amd64
                          (default: host architecture)
  --multiarch             Build a multi-arch manifest for --platform list
  --platform=PLATFORMS    Comma-separated list used with --multiarch
                          (default: linux/amd64,linux/arm64)
  --rev-length=N          Short git revision length for the version tag
                          (default: 7)
  --suffix=SUFFIX         Tag suffix (appended to the version-rev tag)
  -h, --help              Show this help message and exit

Examples:
  $0 -U yohlime --arch=amd64                 # build amd64 locally
  $0 -U yohlime --arch=amd64 -p --suffix=dev # build and push amd64
  $0 -U yohlime --multiarch -p               # build + push multi-arch
EOF
  exit 1
}

while [[ $# -gt 0 ]]; do
  case $1 in
  -m)
    if [[ -n "${2:-}" ]]; then
      BUILD_MODE="$2"
      shift 2
    else
      echo "Error: -m requires a valid build mode"
      usage
    fi
    ;;
  --mode=*)
    BUILD_MODE="${1#*=}"
    shift
    ;;
  -D | --docker)
    ENGINE="docker"
    shift
    ;;
  -p | --push)
    PUSH_BUILD=true
    shift
    ;;
  --registry=*)
    REGISTRY="${1#*=}"
    shift
    ;;
  -n | --image-name=*)
    IMG_NAME="${1#*=}"
    shift
    ;;
  -U)
    if [[ -n "${2:-}" ]]; then
      USERNAME="$2"
      shift 2
    else
      echo "Error: -U requires a username argument"
      usage
    fi
    ;;
  --user=*)
    USERNAME="${1#*=}"
    shift
    ;;
  --suffix=*)
    TAG_SUFFIX="${1#*=}"
    shift
    ;;
  --multiarch)
    MULTIARCH=true
    shift
    ;;
  --rev-length=*)
    REV_LENGTH="${1#*=}"
    if ! [[ "$REV_LENGTH" =~ ^[0-9]+$ ]]; then
      echo "Error: --rev-length requires a positive integer."
      exit 1
    fi
    shift
    ;;
  --platform=*)
    PLATFORM="${1#*=}"
    PLATFORM_SET=true
    shift
    ;;
  --arch=*)
    ARCH="${1#*=}"
    shift
    ;;
  -h | --help) usage ;;
  *)
    echo "Unknown argument: $1"
    usage
    ;;
  esac
done

if [[ -z "${IMG_NAME}" ]]; then
  if [[ -f "package.json" ]]; then
    IMG_NAME=$(jq -r '.name' package.json)
    if [[ "${IMG_NAME}" == "null" || -z "${IMG_NAME}" ]]; then
      IMG_NAME=""
      echo "Error: Image name is not set. Provide --image-name or set 'name' in package.json."
      exit 1
    fi
  fi
fi

if [[ -f "package.json" ]]; then
  PKG_VER=$(jq -r '.version' package.json)
  if [[ "$PKG_VER" == "null" || -z "$PKG_VER" ]]; then
    PKG_VER=""
  fi
fi

if [[ -z "$USERNAME" ]]; then
  echo "Error: Username is required via -U or --user"
  exit 1
fi

if [[ "$MULTIARCH" == true && -n "$ARCH" ]]; then
  echo "Error: --arch and --multiarch are mutually exclusive."
  exit 1
fi

# Which platform(s) this run targets.
ARCH_SUFFIX=""
if [[ "$MULTIARCH" == true ]]; then
  echo "Building multi-arch manifest for: ${PLATFORM}"
elif [[ -n "$ARCH" ]]; then
  if [[ "$ARCH" == */* ]]; then
    PLATFORM="$ARCH"
  else
    PLATFORM="linux/${ARCH}"
  fi
  ARCH_SUFFIX="${ARCH//\//-}"
else
  HOST_ARCH="$(uname -m)"
  case "$HOST_ARCH" in
  x86_64 | amd64) PLATFORM="linux/amd64" ;;
  aarch64 | arm64) PLATFORM="linux/arm64" ;;
  *) PLATFORM="" ;;
  esac
  if [[ -z "$PLATFORM" ]]; then
    echo "Note: unknown host architecture '${HOST_ARCH}', building for the engine default."
  fi
fi

BASE_TAG="${REGISTRY}/${USERNAME}/${IMG_NAME}"

# Version the image by the short git commit instead of a date, so a tag
# maps to an exact revision. Falls back to the date outside a git checkout.
if command -v git >/dev/null 2>&1 && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  REV="$(git rev-parse --short="${REV_LENGTH}" HEAD 2>/dev/null || echo nogit)"
else
  REV="$(date +%Y%m%d)"
fi

TAG_SUFFIXES=""
if [[ -n "$TAG_SUFFIX" ]]; then
  TAG_SUFFIXES="-${TAG_SUFFIX}"
fi
if [[ -n "$ARCH_SUFFIX" ]]; then
  TAG_SUFFIXES="${TAG_SUFFIXES}-${ARCH_SUFFIX}"
fi

VER_TAG="${REV}"
if [[ -n "${PKG_VER}" ]]; then
  VER_TAG="${PKG_VER}-${VER_TAG}"
fi
VER_TAG="${VER_TAG}${TAG_SUFFIXES}"

LATEST_TAG="${BASE_TAG}:latest${TAG_SUFFIXES}"
FULL_TAG="${BASE_TAG}:${VER_TAG}"

if [[ "$MULTIARCH" == true ]]; then
  if [[ "${ENGINE}" == "docker" ]]; then
    if ! docker buildx inspect buildx-builder &>/dev/null; then
      docker buildx create --use --name buildx-builder
    else
      docker buildx use buildx-builder
    fi
    docker buildx inspect --bootstrap

    PUSH_FLAG=""
    [[ "$PUSH_BUILD" == true ]] && PUSH_FLAG="--push"

    echo "Running multi-arch build for ${PLATFORM}..."
    docker buildx build --platform "${PLATFORM}" \
      "${PUSH_FLAG}" \
      -t "${LATEST_TAG}" \
      -t "${FULL_TAG}" \
      --build-arg MODE="${BUILD_MODE}" \
      .
  else
    # Podman builds a manifest list; use arch-specific tags inside it so
    # the same LATEST/FULL tags can hold multiple architectures safely.
    podman manifest rm "${FULL_TAG}" 2>/dev/null || true
    podman manifest create "${FULL_TAG}"

    IFS=',' read -ra ARCHES <<<"${PLATFORM}"
    for p in "${ARCHES[@]}"; do
      echo "Building ${p}..."
      podman build --platform "${p}" \
        --manifest "${FULL_TAG}" \
        --build-arg MODE="${BUILD_MODE}" \
        .
    done

    podman tag "${FULL_TAG}" "${LATEST_TAG}"

    if [[ "$PUSH_BUILD" == true ]]; then
      echo "Pushing manifests..."
      podman manifest push --all "${FULL_TAG}" "docker://${FULL_TAG}"
      podman manifest push --all "${LATEST_TAG}" "docker://${LATEST_TAG}"
    else
      echo "Built local manifest(s) (not pushed):"
      echo "  ${LATEST_TAG}"
      echo "  ${FULL_TAG}"
    fi
  fi
else
  PLATFORM_ARGS=()
  [[ -n "$PLATFORM" ]] && PLATFORM_ARGS=(--platform "${PLATFORM}")

  echo "Building ${PLATFORM:-host platform} with ${ENGINE}..."
  "${ENGINE}" build \
    "${PLATFORM_ARGS[@]}" \
    --build-arg MODE="${BUILD_MODE}" \
    -t "${LATEST_TAG}" \
    -t "${FULL_TAG}" \
    .

  if [[ "$PUSH_BUILD" == true ]]; then
    echo "Pushing image(s)..."
    "${ENGINE}" push "${LATEST_TAG}"
    "${ENGINE}" push "${FULL_TAG}"
  else
    echo "Built local image(s) (not pushed):"
    echo "  ${LATEST_TAG}"
    echo "  ${FULL_TAG}"
  fi
fi
