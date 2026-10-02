# NXU — NEXT YOU · Landing "Coming soon"

Landing de pré-lançamento com captação de WhatsApp. Next.js 16 (App Router) + Supabase + Framer Motion (LazyMotion, ~20 KB).

```
/                     landing (estática, revalidada a cada 5 min)
/privacidade          política de privacidade (LGPD) — revisar com o jurídico
/api/waitlist         POST do cadastro (servidor → RPC do Supabase)
/admin/login          login do painel (Supabase Auth, e-mail + senha)
/admin/waitlist       painel: KPIs, origens, busca, filtros, paginação
/admin/waitlist/export  CSV (separador ;, UTF-8 com BOM, pronto para Excel pt-BR)
```

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # preencha
npm run dev
```

Sem Supabase configurado, o cadastro é **simulado** em desenvolvimento (aparece no log do servidor) para testar o fluxo visual. Em produção ele retorna 503.

## Supabase — configuração

1. Crie o projeto e rode `supabase/migrations/20261002000000_nxu_waitlist.sql` (SQL Editor ou `supabase db push`).
2. Gere um segredo: `openssl rand -hex 32` → coloque em `WAITLIST_API_SECRET` e registre o hash no banco:
   ```sql
   insert into nxu_private.settings (key, value)
   values ('api_secret_sha256', encode(extensions.digest('<SEGREDO>', 'sha256'), 'hex'))
   on conflict (key) do update set value = excluded.value;
   ```
3. Crie o usuário admin em **Authentication → Users** e autorize:
   ```sql
   insert into nxu_private.admins (user_id) select id from auth.users where email = 'voce@dominio.com';
   ```
4. Em **Authentication → Providers → Email**, desative "Allow new users to sign up" (o painel não precisa de cadastro público).

### Modelo de segurança

- `nxu_waitlist` tem RLS ligado e **nenhuma policy para `anon`**: o navegador não consegue ler nem inserir direto.
- O cadastro passa por `/api/waitlist` → `nxu_join_waitlist()` (security definer), que só aceita chamadas com o segredo do servidor. Então mesmo com a anon key pública, ninguém chama o RPC de fora.
- A leitura é liberada só para usuários em `nxu_private.admins`, via RLS. O schema `nxu_private` não é exposto pela API.
- **Não existe service role key no projeto.**
- Anti-spam: honeypot, tempo mínimo de preenchimento, verificação de origem, limite em memória por instância e limite no banco (5 tentativas / 10 min e 20 / 24 h por IP, 300 / min global). O IP é guardado só como hash salgado por até 48 h.
- Telefone normalizado para E.164 (`+5522999999999`) no cliente, no servidor e no banco (constraint), com `unique`. Um número duplicado recebe a mesma resposta de sucesso, para não revelar quem já está na lista.

## Configuração (variáveis de ambiente)

| Variável | Padrão | Uso |
|---|---|---|
| `NEXT_PUBLIC_COUNTDOWN_ENABLED` | `false` | Liga o contador "THE NEXT YOU BEGINS IN" |
| `NEXT_PUBLIC_LAUNCH_DATE` | — | Data ISO com fuso, ex.: `2026-11-20T20:00:00-03:00` |
| `SHOW_WAITLIST_COUNT` | `false` | Mostra "X pessoas já estão esperando." |
| `WAITLIST_COUNT_MIN` | `500` | Só exibe quando o número **real** atinge este mínimo |
| `WAITLIST_COUNT_OFFSET` | `0` | Só para somar cadastros reais coletados fora do banco ou descontar testes. Nunca para inflar. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | — | Número do `wa.me` de confirmação (vazio = botão oculto) |
| `NEXT_PUBLIC_INSTAGRAM_URL` | — | Link do Instagram |
| `NEXT_PUBLIC_LANDING_VARIANT` | `a` | Gravado em `landing_variant` (testes A/B) |
| `NEXT_PUBLIC_GTM_ID` | — | Google Tag Manager (carregado em `lazyOnload`) |

## Imagens

As fotos ainda não existem: placeholders neutros na proporção final aparecem no lugar. Para trocar:

1. Exporte em **AVIF ou WebP** (≈1600×2000 para a principal, 1200×1500 para os detalhes) em `public/images/`.
2. Preencha `src` em `images` dentro de `src/config/site.ts`.

O `next/image` gera os tamanhos responsivos; as imagens abaixo da dobra usam lazy loading. A primeira dobra é só tipografia, então não há imagem para pré-carregar.

O OG image (`src/app/opengraph-image.tsx`) é tipográfico. Quando a foto editorial existir, troque por ela.

## Analytics

`src/lib/analytics.ts` envia para `dataLayer`, `gtag`, Meta Pixel (`Lead`) e TikTok (`SubmitForm`), se estiverem instalados. Eventos: `page_view`, `hero_cta_click`, `waitlist_view`, `whatsapp_input_started`, `waitlist_submit`, `waitlist_success`, `instagram_click`, `whatsapp_confirmation_click`. Nome e telefone nunca são enviados para analytics. UTMs são capturadas no primeiro acesso da sessão e salvas com o lead.

## Pendências antes de publicar

- [ ] Preencher razão social, CNPJ e e-mail do encarregado em `src/app/privacidade/page.tsx` e revisar o texto com o jurídico.
- [ ] Fotos editoriais (ver acima).
- [ ] `NEXT_PUBLIC_SITE_URL` com o domínio final (canonical, sitemap, OG).
