{ pkgs, lib, config, inputs, ... }: {
  packages = with pkgs; [ git curl ];

  languages.javascript = {
    enable = true;
    pnpm = {
      enable = true;
      install.enable = true;
    };
  };

  # Load BACKEND_URL (used by the readiness check below) from the env file `astro dev` uses.
  dotenv.enable = true;
  dotenv.filename = ".env.development";

  enterShell = ''
    pnpm --version
  '';

  # The backend must be up before the dev server starts. Runs on devenv up.
  tasks."backend:wait" = {
    exec = ''
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
