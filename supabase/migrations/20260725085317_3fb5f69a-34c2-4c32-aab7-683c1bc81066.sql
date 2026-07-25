
UPDATE public.legal_documents
SET
  summary = 'Full legal notice for FastMedia.Pro: operator identity, contact, jurisdiction, EU dispute resolution and complaint procedures.',
  content = $$# Imprint / Legal Notice

**Effective date:** 27 May 2026

This imprint is published in accordance with the transparency and information obligations set out in EU Directive 2000/31/EC (E-Commerce Directive), the Czech Act No. 480/2004 Coll. on Certain Information-Society Services and the equivalent national laws that apply to visitors from the United Kingdom, Ireland, Germany and the wider European Economic Area. It identifies the natural or legal person operating this website, the ways in which you can contact us, and the routes available to you for out-of-court dispute resolution.

## Website operator

**FastMedia.Pro** ("FastMedia", "we", "us", "our") operates the website published at [https://www.fastmedia.pro](https://www.fastmedia.pro) and its published subdomains. FastMedia.Pro designs, builds, hosts and maintains conversion-focused websites, AI website calculators, lead-capture and booking systems, email infrastructure and related digital-marketing services for tradespeople, home-service providers and small service businesses in the United Kingdom, Ireland, the Czech Republic, Germany and the wider European market.

## Contact information

- General enquiries and sales: [support@fastmedia.pro](mailto:support@fastmedia.pro)
- Phone (sales, technical support, weekdays 09:00–18:00 CET): **+420 797 864 432**
- WhatsApp: [wa.me/447926400060](https://wa.me/447926400060)
- Registered correspondence address: available on written request to support@fastmedia.pro.

We answer all e-mails within one business day; urgent security matters, abuse reports and take-down notices are prioritised and typically acknowledged within a few hours.

## Responsible person for content

The individual responsible for the editorial content of this website in the sense of Section 55 (2) RStV / Section 18 (2) MStV (Germany) and equivalent EU media laws is the FastMedia.Pro founder, contactable at **support@fastmedia.pro**. All published copy, blog articles, case studies, demo templates and pricing information have been checked for accuracy at the time of publication; we update material regularly and welcome corrections sent to the same address.

## Business and tax information

FastMedia.Pro is a self-employed digital services business registered in the Czech Republic. VAT and trade-licence identification numbers, invoice-issuing details and the competent supervisory authority are provided on written request to [support@fastmedia.pro](mailto:support@fastmedia.pro) and printed in full on every commercial invoice we issue.

## Jurisdiction and governing law

Unless a mandatory consumer-protection rule of your country of residence requires otherwise, contracts concluded with FastMedia.Pro are governed by the laws of the Czech Republic, and the ordinary courts of Prague have exclusive jurisdiction over any dispute arising out of or in connection with them. Consumers residing in the European Economic Area retain the right to bring proceedings before the courts of their country of habitual residence.

## Out-of-court dispute resolution (EU ODR)

The European Commission provides an online dispute resolution platform for consumers at [https://ec.europa.eu/consumers/odr](https://ec.europa.eu/consumers/odr). FastMedia.Pro is willing but not obliged to participate in dispute-resolution proceedings before a consumer arbitration board. Consumer complaints in the Czech Republic can also be submitted to the Czech Trade Inspection Authority (Česká obchodní inspekce, [www.coi.cz](https://www.coi.cz)); UK-based clients may contact the Chartered Trading Standards Institute; German consumers may contact the Universalschlichtungsstelle des Bundes, Kehl am Rhein.

## Complaints, take-downs and abuse reports

If you believe that content on this website infringes your intellectual-property rights, breaches your privacy, or violates applicable law, please email a detailed notice — including your contact details, a description of the disputed content and its exact URL, and, for copyright notices, a statement of ownership — to [support@fastmedia.pro](mailto:support@fastmedia.pro). We investigate every notice and respond within five working days.

## Liability for our content

We compile the information on this website with the greatest possible care. We are responsible for our own content on these pages in accordance with the general laws of the European Union and the Czech Republic. However, we are not obliged to monitor transmitted or stored third-party information or to investigate circumstances that indicate illegal activity. Obligations to remove or block the use of information under the general laws remain unaffected, and any liability in this respect is only possible from the moment we become aware of a specific legal infringement.

## Liability for external links

Our site links to third-party external websites over whose content we have no influence. We cannot therefore accept liability for that external content. The respective provider or operator of the linked pages is always responsible for their content. Linked pages were checked for possible legal violations at the time of linking; illegal content was not detectable at the time. Permanent monitoring of the content of linked pages is not reasonable without concrete evidence of a legal violation — we will remove such links immediately if we learn of any infringement.

## Copyright

Content and works on these pages created by the operator are subject to Czech and EU copyright law. Duplication, processing, distribution and any form of commercialisation of such material beyond the scope of copyright law require the prior written consent of the respective author or creator.

## Updates to this imprint

We update this legal notice whenever our contact details, business status or regulatory obligations change. The effective date at the top of the page reflects the most recent revision; a change history is available on request.
$$,
  updated_at = now()
WHERE slug = 'imprint';
