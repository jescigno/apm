import {
  ACCOUNT_CONTACT_INFO,
  ACCOUNT_SUPPORT_CONTACTS,
} from '../constants/accountPage';

function AccountEditButton({ label }) {
  return (
    <button type="button" className="account-card__edit" aria-label={label}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <path
          d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0 0-3L16.5 4.5a2.1 2.1 0 0 0-3 0L3 15v5z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M13.5 6.5l4 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function AccountInfoCard({ title, editLabel, children }) {
  return (
    <section className="account-card">
      <div className="account-card__header">
        <h2 className="account-card__title">{title}</h2>
        <AccountEditButton label={editLabel} />
      </div>
      <div className="account-card__body">{children}</div>
    </section>
  );
}

function AccountContactInfoCard() {
  const { name, email, phone } = ACCOUNT_CONTACT_INFO;

  return (
    <AccountInfoCard title="Contact Info" editLabel="Edit contact info">
      <p className="account-contact__name">{name}</p>
      <p className="account-contact__detail">{email}</p>
      <p className="account-contact__detail">{phone}</p>
    </AccountInfoCard>
  );
}

function AccountPasswordCard() {
  return (
    <AccountInfoCard title="Password" editLabel="Edit password">
      <p className="account-password" aria-label="Password hidden">
        ••••••••••
      </p>
    </AccountInfoCard>
  );
}

function AccountSupportCard() {
  return (
    <section className="account-card account-card--support">
      <div className="account-card__header">
        <h2 className="account-card__title">Support</h2>
      </div>
      <div className="account-support-grid">
        {ACCOUNT_SUPPORT_CONTACTS.map((contact) => (
          <div key={contact.id} className="account-support-contact">
            <h3 className="account-support-contact__heading">{contact.sectionTitle}</h3>
            <div className="account-support-contact__profile">
              <img
                src={contact.avatarSrc}
                alt=""
                className="account-support-contact__avatar"
                width={48}
                height={48}
              />
              <div className="account-support-contact__details">
                <p className="account-support-contact__name">{contact.name}</p>
                {contact.titleLines.map((line) => (
                  <p key={line} className="account-support-contact__meta">
                    {line}
                  </p>
                ))}
                <p className="account-support-contact__meta">{contact.phone}</p>
                <a href={`mailto:${contact.email}`} className="account-support-contact__email">
                  {contact.email}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function AccountPersonalTab() {
  return (
    <div className="account-personal-grid">
      <div className="account-personal-grid__left">
        <AccountContactInfoCard />
        <AccountPasswordCard />
      </div>
      <div className="account-personal-grid__right">
        <AccountSupportCard />
      </div>
    </div>
  );
}
