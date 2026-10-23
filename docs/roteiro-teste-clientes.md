# Roteiro de teste com clientes (5 minutos por pessoa)

Objetivo: ver, sem ajudar, se quem esteve num evento acha e compra a própria foto, e se quem quer
contratar consegue pedir um orçamento. Três pessoas bastam para achar os problemas grandes.

## Preparação (uma vez, 10 minutos)

- **Site:** rode no seu computador `npm run build && npm run preview -- --host` e anote o endereço
  "Network" que aparece (por exemplo `http://192.168.0.10:4173`). Não é publicação: só quem está na
  mesma rede Wi-Fi abre.
- **Aparelho:** o celular da própria pessoa, conectado na mesma rede, no navegador que ela usa.
- **Conteúdo real:** pelo menos um evento recente em `src/dados/eventos.json` com o link do álbum,
  fotos reais no site (não as molduras) e o preço por foto preenchido.
- **Material:** uma folha de anotação por pessoa (modelo abaixo) e um cronômetro.
- **Privacidade:** peça licença para observar e anotar. Não grave rosto nem tela sem autorização
  por escrito (LGPD). Nas anotações, use "Pessoa 1, 2, 3", sem nome.

## Quem chamar

1. Alguém que esteve numa festa recente fotografada pelo Pedro.
2. Um pai, mãe ou atleta de um jogo recente.
3. Alguém que contrata eventos (organizador, comissão de formatura, mãe de aniversariante).

Cada pessoa faz as duas tarefas. Alterne a ordem: a pessoa 2 começa pela tarefa 2.

## O que dizer no começo

> "Obrigado por ajudar. Estou testando o site, não você: não existe resposta errada. Vá falando em
> voz alta o que está pensando. Durante a tarefa eu não vou ajudar; se travar, me diga o que você
> faria."

## Tarefa 1: achar e comprar uma foto (3 minutos)

> "Você esteve no [nome do evento] em [data]. Encontre uma foto sua e vá até a hora de pagar."

Se a pessoa quiser comprar de verdade, pode. Se não, pare na tela de pagamento do Fotto.

O que observar:

- **Tempo até tocar no evento certo.** Meta: menos de 30 segundos.
- **Caminho:** usou "Encontrar minhas fotos", o "Último evento", a busca, ou só rolou a página?
- **Busca:** se usou, o que digitou, e achou de primeira?
- **Preço:** viu o preço por foto antes de sair do site?
- **Passagem para o Fotto:** percebeu que mudou de site? Desconfiou de algo?
- **No Fotto:** usou a selfie? Achou a própria foto? Onde parou ou voltou?

Sucesso: chegou à tela de pagamento da foto certa, sem ajuda.

## Tarefa 2: pedir um orçamento (2 minutos)

> "Imagine que você quer contratar o Pedro para [uma festa / um jogo] no dia [data futura, em mais ou
> menos um mês]. Peça um orçamento."

O que observar:

- **Formulário:** quanto tempo levou para achar, e por onde veio (botão do topo, rolagem, rodapé)?
- **Campos:** errou algum? A mensagem de erro ajudou a corrigir?
- **WhatsApp:** ao tocar em "Enviar pelo WhatsApp", esperava que ele abrisse? A mensagem pronta
  fazia sentido? Mudaria algo antes de mandar?
- **Preço da cobertura:** procurou? Ficou bem com "combinado pelo WhatsApp"?

Sucesso: o WhatsApp abriu com a mensagem completa. Não precisa enviar.

## Perguntas finais (1 minuto)

1. De 1 (muito difícil) a 7 (muito fácil), como foi achar a sua foto? E pedir o orçamento?
2. O que quase te fez desistir?
3. Faltou alguma informação?
4. Você compraria uma foto ou contrataria por aqui? Por quê?

## Folha de anotação

| | Pessoa 1 | Pessoa 2 | Pessoa 3 |
| --- | --- | --- | --- |
| Perfil (convidado, atleta ou família, contratante) | | | |
| T1: tempo até o evento certo | | | |
| T1: caminho usado | | | |
| T1: viu o preço por foto? | | | |
| T1: chegou ao pagamento? | | | |
| T1: onde hesitou | | | |
| T2: tempo até o formulário | | | |
| T2: erros nos campos | | | |
| T2: a mensagem pronta fez sentido? | | | |
| Nota T1 e T2 (1 a 7) | | | |
| Quase desistiu por | | | |
| Faltou | | | |
| Frase marcante (literal) | | | |

## Depois

- Junte as três folhas. Um problema que aparece em duas de três pessoas é prioridade.
- Guarde as frases literais; elas dizem como os clientes falam.
- Traga os resultados para a próxima sessão, para virar mudanças no site.
