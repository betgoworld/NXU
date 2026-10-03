/** Texto da Política de Privacidade — usado na página /privacidade e no modal. */
// ⚠️ Revise este texto com o jurídico e preencha os dados do controlador antes de publicar.
export const CONTROLLER = "[Razão social] — CNPJ [00.000.000/0000-00]";
export const DPO_EMAIL = "privacidade@nxu.com.br";

export const PRIVACY_UPDATED = "Última atualização: outubro de 2026.";

export function PrivacyContent() {
  return (
    <>
      <h2>Quem somos</h2>
      <p>
        A NXU — NEXT YOU ({CONTROLLER}) é a controladora dos dados pessoais coletados nesta página, nos termos da Lei
        Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).
      </p>

      <h2>Quais dados coletamos</h2>
      <ul>
        <li>Nome e número de WhatsApp, informados por você no formulário.</li>
        <li>
          Dados de origem da visita: parâmetros de campanha (UTM), página de referência, tipo de dispositivo e a versão
          da página visitada.
        </li>
        <li>
          Para evitar abuso, usamos uma versão irreversível (hash) do endereço IP por até 48 horas. O IP em si não é
          armazenado.
        </li>
      </ul>

      <h2>Para que usamos</h2>
      <p>
        Exclusivamente para avisar você sobre o lançamento da NXU e enviar comunicações relacionadas pelo WhatsApp, além
        de medir quais canais trouxeram cadastros. A base legal é o seu consentimento (art. 7º, I, da LGPD), registrado
        no momento do cadastro.
      </p>

      <h2>Compartilhamento</h2>
      <p>
        Não vendemos seus dados. Eles são armazenados em provedor de infraestrutura contratado (Supabase) e podem ser
        processados por ferramentas de envio de mensagens usadas pela NXU, sempre sob obrigação de confidencialidade.
      </p>

      <h2>Por quanto tempo</h2>
      <p>
        Mantemos seus dados enquanto durar a lista de lançamento ou até você pedir a exclusão, o que ocorrer primeiro.
      </p>

      <h2>Seus direitos</h2>
      <p>
        Você pode, a qualquer momento, parar de receber mensagens respondendo “SAIR” no WhatsApp, e solicitar acesso,
        correção, portabilidade ou exclusão dos seus dados, ou revogar o consentimento, pelo e-mail{" "}
        <a className="link link--underlined" href={`mailto:${DPO_EMAIL}`}>
          {DPO_EMAIL}
        </a>
        . Você também pode apresentar reclamação à ANPD.
      </p>

      <h2>Segurança</h2>
      <p>
        Os dados ficam em banco com controle de acesso por linha (RLS): o site público só consegue registrar um
        cadastro, nunca consultar a lista. O acesso é restrito a pessoas autorizadas da NXU, com autenticação.
      </p>
    </>
  );
}
