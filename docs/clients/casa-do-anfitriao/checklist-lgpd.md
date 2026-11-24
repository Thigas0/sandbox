# Checklist LGPD — site da Casa do Anfitrião

Premissa do plano: site estático, **sem backend próprio**, com contato pelo WhatsApp. Este checklist
não substitui orientação jurídica.

## 1. O que o site vai coletar

| Dado                                      | Onde                                         | Coletado pelo site?                                                                    | Decisão                                           |
| ----------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Nome, telefone e mensagem                 | Botão `wa.me` (WhatsApp)                     | **Não.** O usuário abre o WhatsApp e o dado vai direto para a conta do cliente (Meta como controladora do app) | Informar na política                              |
| Dados de formulário (se houver)           | Serviço de formulário de terceiro            | Sim, por meio do operador                                                              | **Só com serviço aprovado por você** (ponto 4)   |
| Endereço IP, user agent                   | Logs da hospedagem                           | Sim (hospedagem como operadora)                                                        | Listar o provedor na política                     |
| Cookies de analytics                      | Google Analytics ou similar                  | Só se o cliente quiser                                                                 | Preferir analytics **sem cookies** (ex.: Plausible, Cloudflare Web Analytics) ou exigir consentimento |
| Mapa incorporado                          | iframe do Google Maps                        | Sim (Google define cookies)                                                            | Preferir **link** "Como chegar" ou carregar o mapa só após clique |
| Fontes                                    | Google Fonts via CDN                         | IP enviado ao Google                                                                   | **Auto-hospedar as fontes**                       |
| Vídeos do Instagram, YouTube ou TikTok    | Embeds                                       | Sim (cookies de terceiros)                                                             | Usar a variante sem cookies ou carregar após clique |

## 2. Consentimento de cookies

- [ ] Inventariar todos os cookies e armazenamentos depois do build (DevTools e Playwright).
- [ ] Se houver **apenas cookies estritamente necessários**: não é preciso banner de consentimento.
      Basta um aviso na política.
- [ ] Se houver analytics, marketing ou embeds com cookies: banner com **"Aceitar" e "Recusar" com o
      mesmo destaque**, nada pré-marcado, nenhum script carregado antes do aceite e um link para
      revogar o consentimento no rodapé.
- [ ] Registrar a escolha só no `localStorage` do visitante (sem envio a servidor).

## 3. Política de privacidade (página `/privacidade`)

- [ ] Controlador: razão social, CNPJ 40.350.897/0001-06, endereço e contato.
- [ ] Encarregado (DPO) ou canal de contato para titulares. Microempresas podem ter dispensa de nomear
      encarregado (Resolução CD/ANPD nº 2/2022), mas precisam manter um canal de comunicação.
- [ ] Quais dados são tratados, para quê e com qual base legal (art. 7º da LGPD; ex.: execução de
      pedido ou legítimo interesse para os logs).
- [ ] Operadores e terceiros: hospedagem, WhatsApp/Meta, analytics, formulário.
- [ ] Prazo de retenção.
- [ ] Direitos do titular (art. 18) e como exercê-los.
- [ ] Transferência internacional (servidores fora do Brasil, art. 33).
- [ ] Data da última atualização.

## 4. Imagem, depoimentos e conteúdo de terceiros

- [ ] Autorização de uso de imagem, por escrito, de cada pessoa identificável nas fotos (equipe e
      clientes).
- [ ] Autorização por escrito para cada depoimento publicado com nome. Sem autorização, usar o trecho
      anonimizado ou não publicar.
- [ ] Licença ou cessão de direitos das fotos do fotógrafo.
- [ ] Nada copiado do Instagram, do Google ou da imprensa sem autorização.

## 5. Segurança (ligado à Fase 5)

- [ ] HTTPS obrigatório.
- [ ] CSP restritiva. Nenhum script de terceiro sem necessidade.
- [ ] Nenhum dado pessoal no repositório (sem planilhas de clientes, sem `.env`).
- [ ] Links externos com `rel="noopener noreferrer"`.
