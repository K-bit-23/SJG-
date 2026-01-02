{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = [
    pkgs.python3
    pkgs.python3Packages.django
    pkgs.python3Packages.djangorestframework
    pkgs.python3Packages.django-cors-headers
    pkgs.python3Packages.djongo
  ];

  shellHook = ''
    python backend/seed.py
  '';
}
