# Como atualizar o site

Os textos variáveis, os eventos e as fotos ficam em `src/dados/`. Ninguém precisa mexer no HTML
para o dia a dia. Depois de cada mudança, rode `./scripts/verify.sh`: se algo estiver errado, o
build para e diz o arquivo, o item e o que corrigir.

## Adicionar um evento

1. Abra `src/dados/eventos.json`.
2. Copie um bloco e preencha os quatro campos:

   ```json
   {
     "nome": "Festa da Primavera",
     "data": "2026-10-18",
     "local": "Clube Tal, Campinas",
     "fotto": "https://www.fotto.com.br/pdl_fotografia_imagem/..."
   }
   ```

   - `data` vai como ano-mês-dia (`2026-10-18`). O site mostra "18 de outubro de 2026".
   - `fotto` é o link do álbum do evento, copiado da barra de endereço do Fotto.
   - Separe os blocos com vírgula, mas não ponha vírgula depois do último.
3. A ordem no arquivo não importa: o site mostra do mais recente para o mais antigo, e o primeiro
   aparece também na abertura como "Último evento".
4. Rode `npm run format` (arruma os espaços) e `./scripts/verify.sh`.

Para conferir no navegador, veja [Ver o site](#ver-o-site).

## Trocar ou incluir uma foto

1. Coloque o arquivo original em `fotos-originais/` (por exemplo `fotos-originais/festas/IMG_0123.jpg`).
   Essa pasta nunca vai para o Git.
2. Em `src/dados/fotos.json`, troque o `arquivo` de uma foto ou acrescente um bloco:

   ```json
   {
     "id": "festa-pista-01",
     "arquivo": "festas/IMG_0123.jpg",
     "alt": "Amigos dançando de braços dados na pista",
     "legenda": "Festa da Primavera, 2026",
     "pessoasIdentificaveis": true,
     "foco": "50% 30%"
   }
   ```

   - `id`: letras minúsculas, números e hífens; vira o nome dos arquivos publicados.
   - `alt`: o que a foto mostra, para quem usa leitor de tela.
   - `pessoasIdentificaveis`: `true` quando dá para reconhecer alguém. Confirme a autorização de
     uso de imagem antes de publicar.
   - `foco` (opcional): o ponto que não pode ser cortado, na horizontal e na vertical.
   - `"capa": true` (opcional, em uma só foto): ela abre a página e vira a imagem da prévia do
     link no WhatsApp. Sem isso, vale a primeira da lista.
   - `"cobertura": true` (opcional, em uma só foto): ela ilustra os quatro passos da Cobertura e
     sai de Trabalho. Sem isso, vale a última da lista.
   - A ordem da lista é a ordem em que as fotos aparecem em Trabalho, em pares desencontrados que
     se repetem a cada oito. No computador, a 1ª e a 5ª de cada oito ficam em pé (3:4), a 2ª e a 6ª
     quase quadradas (5:4), a 3ª e a 7ª deitadas (3:2) e a 4ª e a 8ª, pequenas, em pé (4:5). Use o
     `foco` para que o recorte não corte o que importa.
3. Rode `npm run fotos`. Ele gera as versões AVIF e WebP em `public/fotos/` (lado maior até
   2000 px, crédito no EXIF, sem GPS), atualiza `public/og.jpg` e apaga as versões das fotos que
   saíram.
4. Rode `./scripts/verify.sh` e faça o commit de `src/dados/` e `public/`.

## Dados do fotógrafo

`src/dados/site.json` guarda nome, cidade, WhatsApp (só números, com 55 e DDD), e-mail, Instagram
(sem @), links do Behance e do Fotto, endereço do site, preço por foto, prazo de entrega e crédito.
Enquanto um valor não for confirmado, ele fica como `A CONFIRMAR`, e o teste de texto
(`./scripts/verify.sh --full`) acusa onde ele aparece.

## Ver o site

No terminal do Ubuntu (WSL), dentro da pasta do repositório, rode `npm ci` e depois `npm run dev`.
O `npm ci` só é necessário na primeira vez e quando o `package.json` mudar. Abra
http://localhost:5173 no navegador do Windows. Deixe o terminal aberto enquanto olha; `Ctrl+C`
desliga. Salvar um arquivo de `src/dados/` recarrega a página sozinha. Para ver o site exatamente
como vai ao ar, rode `npm run build && npm run preview` e abra http://localhost:4173.

Para ver a versão de celular no computador, abra o Chrome ou o Edge, aperte `F12`, depois
`Ctrl+Shift+M`, e escolha um celular.

Para ver no seu celular, na mesma rede Wi-Fi, rode `npm run dev -- --host` e abra no celular o
endereço "Network" que aparece. No WSL 2 esse endereço é interno do Windows, e o celular só o
alcança depois deste ajuste, feito uma vez só (Windows 11 22H2 ou mais novo):

1. Crie o arquivo `C:\Users\<seu usuário>\.wslconfig` com:

   ```ini
   [wsl2]
   networkingMode=mirrored
   ```

2. No PowerShell aberto como administrador, libere as portas do site e reinicie o WSL:

   ```powershell
   New-NetFirewallHyperVRule -Name SitePDL -DisplayName "Site PDL" -Direction Inbound -VMCreatorId '{40E0AC32-46A5-438A-A0B2-2B479E8F2E90}' -Protocol TCP -LocalPorts 5173,4173
   wsl --shutdown
   ```

3. Abra o Ubuntu de novo e rode `npm run dev -- --host`. O endereço "Network" passa a ser o da sua
   rede, algo como `http://192.168.0.10:5173`.

Isso não publica nada: só aparelhos na mesma rede abrem o endereço, e só enquanto o comando estiver
rodando. No Windows 10 o caminho é outro (`netsh interface portproxy`); veja
[a documentação do WSL](https://learn.microsoft.com/pt-br/windows/wsl/networking).
