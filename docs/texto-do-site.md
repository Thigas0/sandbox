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

- Marca: PDL Fotografia & Imagem (vira o logo na Fase 3)
- Menu: Fotos · Trabalho · Cobertura · Perguntas
- Ação: Pedir orçamento

## Abertura (primeira tela)

- Título: **Festas e jogos, de perto**
- Apoio: Pedro De Lucca fotografa festas, eventos e jogos em Campinas e região. As fotos de cada
  evento ficam à venda no Fotto.
- Botão: Encontrar minhas fotos · Link: Pedir orçamento
- Abaixo: "Último evento: {nome do evento mais recente}, {data}" (vem de `eventos.json`)

A frase que você aprovou como provisória ("Festas e jogos fotografados de perto, do jeito que
aconteceram.") virou a descrição do negócio nos dados estruturados. Na tela, ela foi dividida entre
o título curto e o apoio, porque um título de primeira tela precisa caber em duas linhas no celular.

## Encontre suas fotos

- Título: Encontre suas fotos
- Texto: Procure o evento pelo nome, pelo local ou pelo mês. Cada link abre o álbum certo no Fotto.
- Campo de busca: "Nome do evento, local ou mês"
- Sem resultado: Nenhum evento com esse nome. Veja todos os álbuns no Fotto ou pergunte pelo WhatsApp.
- Lista vazia (enquanto não houver eventos): Os álbuns aparecem aqui assim que as fotos entram no
  Fotto. Enquanto isso, veja todos os álbuns no Fotto.
- Subtítulo: Como comprar
  1. Abra o seu evento na lista.
  2. No Fotto, encontre-se com uma selfie ou navegue pelo álbum.
  3. Escolha as fotos e pague online. Cada foto custa {precoFoto}.

## Trabalho

- Título: Trabalho
- Texto: Uma seleção de festas e jogos. O portfólio completo está no Behance.
- Fotos: a seleção de 12 a 20 (proposta na Fase 1), cada uma com descrição para leitor de tela e
  legenda opcional.

## Cobertura do seu evento

- Título: Cobertura do seu evento
- Texto: Festas, eventos e jogos esportivos em Campinas e região.
  1. Você conta pelo WhatsApp a data, o local e o tipo de evento.
  2. Combinamos o preço, que depende da data, do local e da duração.
  3. No dia, eu fotografo de perto, do jeito que tudo acontece.
  4. Você recebe as fotos em {prazoEntrega}.

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
- Abaixo: Prefere e-mail? {email}
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

- PDL Fotografia & Imagem (grande)
- Links: Instagram · Behance · Fotto · Privacidade
- Fotos de Pedro De Lucca. © {ano} PDL Fotografia & Imagem.

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
| `url` | A CONFIRMAR | prévia do link no WhatsApp e dados estruturados |

Já confirmados: Pedro De Lucca, Campinas (SP), WhatsApp +55 15 99698-8578, @pdl_fotografia_imagem,
Behance pedrodelucca2, Fotto pdl_fotografia_imagem.
