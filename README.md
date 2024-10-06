# Urbit Community Manager

Create self-hosted communities on Urbit.
Currently supports Blog, Static sites, Chat, Forum, Radio and Wiki apps.
Supports EAuth and Metamask login with Urbit ID.


### Installation
Two options:
- On dojo run `|install ~dister-dozzod-sortug %ucm`.
- Build locally:
1. Build the site frontend, `cd site && bun run build`.
2. Rename and replace the built files because Urbit can't read capital letters! Just lovely. Inside the `site` folder do `bun rename-files.js`
3. Symlink the `desk` folder to a folder inside your pier, then commit and `|install our <name>`.
