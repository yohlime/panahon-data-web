{ pkgs, lib, config, inputs, ... }: {
  packages = with pkgs; [ git curl ];

  languages.javascript = {
    enable = true;
    pnpm = {
      enable = true;
      install.enable = true;
    };
  };

  enterShell = ''
    pnpm --version
  '';

  # The backend must be up before the dev server starts. Runs on devenv up.
  # BACKEND_URL is read from .env.development inside this task only, so the
  # shell env is not polluted with APP_HOST/PUBLIC_PANAHON_API (Vite lets
  # process.env override the .env files, which would break the dev bind/base).
  tasks."backend:wait" = {
    exec = ''
      set -a
      . ./.env.development
      set +a
      : "''${BACKEND_URL:?BACKEND_URL is not set in .env.development}"
      until curl -s -o /dev/null --max-time 2 "$BACKEND_URL"; do
        echo "Waiting for backend on $BACKEND_URL ..."
        sleep 2
      done
    '';
    showOutput = true;
  };

  # `devenv up` installs deps, waits for the backend, then runs the Astro dev server.
  processes.web = {
    exec = "pnpm dev";
    after = [ "backend:wait" ];
  };

  enterTest = ''
    pnpm exec vitest --run
  '';
}
