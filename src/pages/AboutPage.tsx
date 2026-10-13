import { Logo } from '../components/Logo';

export function AboutPage() {
  return (
    <section className="content-page" aria-labelledby="about-title">
      <Logo size={40} withWordmark={false} />
      <p className="eyebrow">Why the blockout</p>
      <h1 id="about-title">Attention is power. Withhold it.</h1>
      <p className="page-description">
        Operation Blockout is a community-led boycott urging people to withdraw
        follows, views, and spending from celebrities they believe have stayed
        silent about the genocide in Gaza. This directory helps people find
        accounts and keep track of their own choices.
      </p>
      <div className="information-card">
        <h2>Check the record for yourself</h2>
        <p>
          The directory contains usernames only. It does not cite or verify each
          person’s public statements, silence, or position. A listing is not
          proof of a stance. Review statements from the person’s own public
          accounts and other reliable sources before deciding what to do.
        </p>
      </div>
      <div className="information-card">
        <h2>Your decision. Your action.</h2>
        <p>
          Adding an account saves its username to your Blockout list in this
          browser. It does not unfollow, block, report, or contact anyone on
          Instagram. This project is not affiliated with Instagram or Meta.
        </p>
      </div>
      <div className="information-card">
        <h2>Timeline methodology</h2>
        <p>
          Timeline entries are a concise selection, checked against the public
          records linked on each entry, including United Nations resolutions,
          reports, and court documents. Legal findings are attributed to the
          body that issued them. Dates and descriptions may be revised when
          source records are corrected or new records become available, and
          historical interpretations can differ.
        </p>
      </div>
    </section>
  );
}
