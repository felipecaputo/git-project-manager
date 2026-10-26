Changelog

Todas as alterações relevantes deste projeto são documentadas neste arquivo.

O formato segue as convenções do "Keep a Changelog" (https://keepachangelog.com/pt-BR/1.1.0/) e utiliza versionamento semântico (SemVer).

[Unreleased]

Planejado

- Registrar alterações futuras após sua implementação e validação.
- Atualizar a versão e a data de lançamento somente quando uma nova versão for publicada.

[1.9.0] - 2026-10-26

Adicionado

- Implementada uma verificação de segurança no fluxo de publicação para reduzir o risco de exposição acidental de credenciais e tokens.
- Integrados hooks do "pre-commit" para validar arquivos sensíveis localmente.
- Adicionado o script "minimist-updater" para automatizar a atualização da dependência "minimist" para a versão "1.2.8", com preservação de backups e execução do npm com a opção "--ignore-scripts".

Corrigido

- Corrigidas inconsistências menores no carregamento das configurações do workspace.

Alterado

- Atualizadas as dependências do projeto.
- Incluída a auditoria de dependências com "npm audit" no processo de verificação de segurança.

[1.8.0]

<!-- Preserve aqui o histórico original da versão 1.8.0 e das versões anteriores. -->