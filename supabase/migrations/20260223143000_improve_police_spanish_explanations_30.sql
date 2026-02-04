with updates (slug, explanation, explanation_en) as (
  values
    ('polizei-spanisch-2026-67', '"Registro del vehículo" ist die offizielle Durchsuchung eines Fahrzeugs. "Registro" wird im Polizeikontext für eine Suche mit Dokumentation verwendet.', '"Registro del vehículo" is the official search of a vehicle. "Registro" is used in policing for a documented search.'),
    ('polizei-spanisch-2026-68', '"Documento de identidad" ist der formelle Begriff für Ausweis/ID. In Spanien ist der gebräuchliche Kurznamen "DNI".', '"Documento de identidad" is the formal term for an ID. In Spain the common abbreviation is "DNI".'),
    ('polizei-spanisch-2026-69', '"Control de identidad" bedeutet Personenkontrolle durch die Polizei, z. B. bei einer Kontrolle auf der Straße.', '"Control de identidad" is an identity check by police, for example during a street control.'),
    ('polizei-spanisch-2026-70', '"Arma" ist grammatisch feminin, nimmt aber im Singular den Artikel "el" (el arma). Im Plural heißt es "las armas".', '"Arma" is grammatically feminine but takes "el" in singular (el arma). In plural it becomes "las armas".'),
    ('polizei-spanisch-2026-71', '"Cámara de seguridad" meint CCTV-Überwachung, die Beweise liefern kann. Das Wort "seguridad" betont den Sicherheitszweck.', '"Cámara de seguridad" refers to CCTV used for security and evidence. The word "seguridad" highlights its security purpose.'),
    ('polizei-spanisch-2026-72', '"Recogida de indicios" beschreibt das Sammeln von Spuren am Tatort, inklusive Dokumentation, Verpackung und Kettennachweis.', '"Recogida de indicios" is collecting traces at a crime scene, including documentation, bagging, and chain of custody.'),
    ('polizei-spanisch-2026-73', '"Móvil" heißt Tatmotiv. Das ist nicht dasselbe wie ein Handy, obwohl die Schreibweise gleich ist.', '"Móvil" means motive in crime context. It is not the same as a mobile phone despite the same spelling.'),
    ('polizei-spanisch-2026-74', '"Coartada" ist ein Alibi, also ein belegbarer Aufenthaltsnachweis zur Tatzeit, der die Täterschaft ausschließen kann.', '"Coartada" is an alibi, a verifiable whereabouts claim that can exclude involvement.'),
    ('polizei-spanisch-2026-75', '"Bajo arresto" bezeichnet Gewahrsam oder Festnahmezustand. Häufig mit "estar" verwendet: "estar bajo arresto".', '"Bajo arresto" means being under arrest or in custody, often used with "estar".'),
    ('polizei-spanisch-2026-76', '"Prisión preventiva" ist Untersuchungshaft vor dem Urteil, etwa zur Flucht- oder Verdunkelungsprävention.', '"Prisión preventiva" is pretrial detention to prevent flight or evidence tampering.'),
    ('polizei-spanisch-2026-77', '"Poner una denuncia" ist die Standardformulierung für eine Anzeige bei der Polizei. Synonym ist "presentar una denuncia".', '"Poner una denuncia" is the standard way to say filing a police report. "Presentar una denuncia" is a close synonym.'),
    ('polizei-spanisch-2026-78', '"Coche patrulla" ist der Streifenwagen im Patrouillendienst. Umgangssprachlich hört man auch "coche policial".', '"Coche patrulla" is a patrol car on duty. Colloquially you may also hear "coche policial".'),
    ('polizei-spanisch-2026-79', '"Búsqueda" ist die Fahndung oder Suche nach einer Person oder Sache. In Fahndungen wird oft "búsqueda policial" ergänzt.', '"Búsqueda" means search or manhunt. In police contexts you may hear "búsqueda policial".'),
    ('polizei-spanisch-2026-80', '"Número de placa" ist die Badge- oder Dienstnummer eines Polizeibeamten und steht auf der Dienstmarke.', '"Número de placa" is an officer badge or service number printed on the badge.'),
    ('polizei-spanisch-2026-81', '"Control de tráfico" ist eine Verkehrskontrolle, z. B. für Alkoholtests oder Dokumentenkontrollen.', '"Control de tráfico" is a traffic stop, for example for alcohol tests or document checks.'),
    ('polizei-spanisch-2026-82', '"Chaleco antibalas" heißt kugelsichere Weste. "Antibalas" bedeutet wörtlich "gegen Kugeln".', '"Chaleco antibalas" means bulletproof vest; "antibalas" literally means against bullets.'),
    ('polizei-spanisch-2026-83', '"Arma del crimen" ist die Tatwaffe, also die Waffe, mit der eine Straftat begangen wurde.', '"Arma del crimen" is the crime weapon, the weapon used to commit an offense.'),
    ('polizei-spanisch-2026-84', '"Autor" bezeichnet den Täter oder Urheber einer Tat. In Berichten steht oft "autor de los hechos".', '"Autor" refers to the perpetrator or offender. Reports often say "autor de los hechos".'),
    ('polizei-spanisch-2026-85', '"Víctima" ist das Opfer. Das Wort wird in Strafanzeigen und Zeugenaussagen sehr häufig verwendet.', '"Víctima" is the victim. The term is common in police reports and witness statements.'),
    ('polizei-spanisch-2026-86', '"Prueba" ist ein Beweismittel; im Plural "pruebas" sind mehrere Beweise. Es kann auch einen Test bedeuten, der Kontext ist entscheidend.', '"Prueba" is evidence; plural "pruebas" are multiple pieces of evidence. It can also mean test, so context matters.'),
    ('polizei-spanisch-2026-87', '"Declaración del testigo" ist die protokollierte Aussage eines Zeugen während einer Vernehmung.', '"Declaración del testigo" is the recorded statement of a witness during questioning.'),
    ('polizei-spanisch-2026-88', '"Legítima defensa" ist Notwehr, also eine rechtlich erlaubte Verteidigung gegen einen Angriff.', '"Legítima defensa" is self-defense, a legally justified response to an attack.'),
    ('polizei-spanisch-2026-89', '"Identificación" meint die Feststellung der Personalien oder Identität, häufig im Rahmen einer Kontrolle.', '"Identificación" refers to establishing or verifying identity, often during a police check.'),
    ('polizei-spanisch-2026-90', '"Vehículo de fuga" ist das Fluchtfahrzeug nach einer Tat, oft in Fahndungsnotizen erwähnt.', '"Vehículo de fuga" is the getaway vehicle, often mentioned in manhunt notices.'),
    ('polizei-spanisch-2026-91', '"Falso testimonio" bezeichnet eine Falschaussage gegenüber Polizei oder Gericht und ist strafbar.', '"Falso testimonio" is false testimony to police or court and is a criminal offense.'),
    ('polizei-spanisch-2026-92', '"Aviso por radio" ist eine Meldung oder Durchsage über Funk an Einsatzkräfte.', '"Aviso por radio" is a radio alert or announcement to officers.'),
    ('polizei-spanisch-2026-93', '"Indicio" ist ein Anhaltspunkt oder Verdachtsmoment. Es ist weniger als ein Beweis, aber wichtig für Ermittlungen.', '"Indicio" is a clue or indication. It is less than proof but important for investigations.'),
    ('polizei-spanisch-2026-94', '"Vigilancia" bedeutet Überwachung oder Beobachtung, z. B. eine verdeckte Überwachung.', '"Vigilancia" means surveillance or monitoring, for example covert surveillance.'),
    ('polizei-spanisch-2026-95', '"Hallazgo de indicios" ist das Auffinden von Spuren, die später als Beweise dienen können.', '"Hallazgo de indicios" is finding traces that may later serve as evidence.'),
    ('polizei-spanisch-2026-96', '"Cordón policial" ist die polizeiliche Absperrung eines Bereichs, um einen Tatort zu sichern.', '"Cordón policial" is a police cordon used to secure an area or crime scene.')
)
update public.questions q
set explanation = u.explanation
from updates u
where q.slug = u.slug;

update public.question_translations qt
set explanation = u.explanation_en
from updates u
join public.questions q on q.slug = u.slug
where qt.question_id = q.id
  and qt.language = 'en';
