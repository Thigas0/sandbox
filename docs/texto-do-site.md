# Texto do site: rascunho para aprovação

Todo o texto que aparece no site, por seção. Os dados de `src/dados/site.json` entram entre
chaves (`{precoFoto}`) e estão listados no fim. Marque o que trocar; nada aqui é definitivo até
você aprovar.

Os quatro pontos marcados [confirmar] na primeira versão já foram respondidos: selfie no Fotto (sim),
Campinas e região, o cliente da cobertura recebe as fotos, e o Pedro tira uma foto do Fotto quando
pedem.

## Título e descrição (busca e prévia do link)

- Título da aba: PDL Fotografia & Imagem – festas e jogos em Campinas
- Descrição: Fotos de festas e jogos em Campinas e região por Pedro De Lucca. Ache o seu evento e
  compre suas fotos no Fotto, ou peça um orçamento pelo WhatsApp.

## Cabeçalho

- Na página inicial não há logo no cabeçalho: o logo grande da abertura já é a marca.
- Menu: Fotos · Trabalho · Cobertura · Perguntas (no celular, só "Fotos")
- Ação: Pedir orçamento
- Na página de privacidade: o logo vetorizado, que leva ao início.

## Abertura (primeira tela)

- Título: o logo, grande, com a foto de capa dentro da lente. Leitores de tela ouvem "PDL Fotografia
  & Imagem".
- Apoio: Pedro De Lucca fotografa festas, eventos e jogos em Campinas e região. As fotos de cada
  evento ficam à venda no Fotto.
- Botão: Encontrar minhas fotos
- Abaixo: "Último evento: {nome do evento mais recente}, {data}", que vem de `eventos.json`.
  Enquanto não houver eventos: "Ver os álbuns no Fotto".

A frase que você aprovou como provisória ("Festas e jogos fotografados de perto, do jeito que
aconteceram.") virou a descrição do negócio nos dados estruturados.

## Encontre suas fotos

- Título: Encontre suas fotos
- Campo de busca: "Nome do evento, local ou mês"
- Ao lado da busca, os três passos:
  1. Abra o seu evento na lista.
  2. No Fotto, encontre-se com uma selfie ou navegue pelo álbum.
  3. Escolha as fotos e pague online. Cada foto custa {precoFoto}.
- Cada linha da lista: nome do evento · local · data por extenso. A linha inteira é o link do
  álbum.
- Sem resultado: Nenhum evento com esse nome. Veja todos os álbuns no Fotto ou pergunte pelo WhatsApp.
- Lista vazia (enquanto não houver eventos): Os álbuns aparecem aqui assim que as fotos entram no
  Fotto. Enquanto isso, veja todos os álbuns no Fotto.

## Trabalho

- Título: Trabalho
- Texto: Uma seleção de festas e jogos. O portfólio completo está no Behance.
- Fotos: a seleção de 12 a 20, cada uma com descrição para leitor de tela e legenda curta (evento,
  cidade, mês). Hoje são molduras provisórias.

## Cobertura do seu evento

- Título: Cobertura do seu evento
- Quatro passos, cada um sob um quadro em que a lente se abre mais, com uma linha de apoio:
  - **Você chama no WhatsApp.** Conta a data, o local e o tipo de evento.
  - **Combinamos o preço.** Ele depende da data, do local e da duração.
  - **No dia, eu fotografo.** Festas, eventos e jogos em Campinas e região, de perto.
  - **Você recebe as fotos.** Em {prazoEntrega} depois do evento.

## Peça um orçamento

- Título: Peça um orçamento
- Texto: Preencha e o WhatsApp abre com a mensagem pronta. Nada fica guardado neste site.
- Campos: Tipo de evento (Festa, Jogo ou campeonato, Outro evento) · Data do evento · Cidade · Seu
  nome · Detalhes (opcional): "Horário, número de convidados, o que não pode faltar."
- Botão: Enviar pelo WhatsApp
- Mensagem que chega no WhatsApp: "Olá! Sou {nome}. Quero um orçamento de cobertura: {tipo}, {data},
  {cidade}. Detalhes: {detalhes}"
- Erros: Escolha o tipo de evento. · Informe a data do evento. · A data precisa ser hoje ou depois. ·
  Informe a cidade do evento. · Informe o seu nome.
- Sucesso: O WhatsApp abriu em outra aba com a sua mensagem. É só enviar.
- Janela bloqueada: O navegador bloqueou a nova janela. Abra o WhatsApp pelo link abaixo ou copie a
  mensagem. · [Abrir o WhatsApp] [Copiar mensagem] · Mensagem copiada. Agora é só colar no WhatsApp.
- No cupom, abaixo do texto: Prefere e-mail? {email}
- Sem JavaScript: Sem JavaScript, escreva para {email} ou chame no Instagram @pdl_fotografia_imagem.

## Perguntas

- **Quanto custa uma foto?** Cada foto custa {precoFoto} no Fotto.
- **Como acho a minha foto?** Abra o evento na lista acima. No Fotto, uma selfie mostra só as fotos
  em que você aparece; você também pode navegar pelo álbum inteiro.
- **Quando as fotos ficam prontas?** Em {prazoEntrega} depois do evento.
- **Quanto custa uma cobertura?** Depende da data, do local e da duração. O preço é combinado pelo
  WhatsApp: comece pelo pedido de orçamento.
- **Posso pedir para tirar uma foto minha do ar?** Pode. Mande o link da foto pelo WhatsApp ou para
  {email} e ela sai deste site e do Fotto.

## Rodapé

- Links: Instagram · Behance · Fotto, e Encontrar minhas fotos · Pedir orçamento · Privacidade
- O logo de ponta a ponta, em cores invertidas
- Fotos de Pedro De Lucca. © {ano} PDL Fotografia & Imagem, Campinas e região.

## Página de privacidade

- **Privacidade.** Este site não usa cookies, não tem rastreamento e não guarda dados de quem
  visita. As fontes e as imagens vêm do próprio site, sem serviços de terceiros.
- **Pedido de orçamento.** O formulário não envia nada para este site. Ele só monta uma mensagem e
  abre o WhatsApp no seu aparelho, e você decide se envia. A conversa fica no WhatsApp, e Pedro De
  Lucca usa esses dados apenas para responder ao seu pedido.
- **Compra de fotos.** As fotos dos eventos são vendidas pelo Fotto, que tem a sua própria política
  de privacidade para a busca por selfie e para o pagamento.
- **Fotos em que você aparece.** Se você aparece em uma foto e quer que ela saia deste site ou do
  Fotto, peça pelo WhatsApp ou para {email}. Você também pode pedir acesso, correção ou exclusão dos
  seus dados, como prevê a Lei Geral de Proteção de Dados (Lei 13.709/2018).
- **Responsável.** Pedro De Lucca, PDL Fotografia & Imagem, Campinas (SP). Contato: {email}.
- Atualizada em outubro de 2026.

## Dados que ainda faltam (em `src/dados/site.json`)

| Campo | Hoje | Onde aparece |
| --- | --- | --- |
| `email` | A CONFIRMAR | orçamento, perguntas, privacidade |
| `precoFoto` | A CONFIRMAR | "Como comprar" e perguntas (ex.: "R$ 15") |
| `prazoEntrega` | A CONFIRMAR | cobertura e perguntas (ex.: "até 3 dias") |

Já confirmados: Pedro De Lucca, Campinas (SP), WhatsApp +55 15 99698-8578, @pdl_fotografia_imagem,
Behance pedrodelucca2, Fotto pdl_fotografia_imagem, endereço https://pdl-fotografia-imagem.com.br.
