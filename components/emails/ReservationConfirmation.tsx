import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from "@react-email/components";

export interface ReservationConfirmationProps {
  readonly clubName: string;
  readonly memberName: string;
  readonly venueName: string;
  readonly date: string;
  readonly time: string;
  readonly partySize: number;
  readonly occasion?: string;
  readonly notes?: string;
  readonly dietaryFlags: ReadonlyArray<string>;
  readonly manageUrl: string;
}

export function ReservationConfirmation({
  clubName,
  memberName,
  venueName,
  date,
  time,
  partySize,
  occasion,
  notes,
  dietaryFlags,
  manageUrl,
}: ReservationConfirmationProps) {
  const preview = `${venueName} · ${date} at ${time} for ${partySize}`;

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Text style={eyebrow}>{clubName}</Text>
            <Heading as="h1" style={h1}>
              We have you down for {date.toLowerCase()}.
            </Heading>
          </Section>

          <Section style={card}>
            <Row label="Venue" value={venueName} />
            <Row label="Time" value={time} />
            <Row label="Party" value={String(partySize)} />
            {occasion ? <Row label="Occasion" value={capitalise(occasion)} /> : null}
          </Section>

          {dietaryFlags.length > 0 ? (
            <Section style={dietary}>
              <Text style={dietaryLabel}>Dietary needs flagged for the kitchen</Text>
              <Text style={dietaryValue}>{dietaryFlags.join(" · ")}</Text>
            </Section>
          ) : null}

          {notes ? (
            <Section style={notesSection}>
              <Text style={dietaryLabel}>Your note</Text>
              <Text style={italic}>"{notes}"</Text>
            </Section>
          ) : null}

          <Hr style={hr} />

          <Section>
            <Text style={para}>
              We look forward to welcoming you, {memberName}. To change or cancel,{" "}
              <Link href={manageUrl} style={link}>
                view your reservation
              </Link>
              .
            </Text>
          </Section>

          <Text style={footer}>{clubName} — see you soon.</Text>
        </Container>
      </Body>
    </Html>
  );
}

function Row({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <table cellPadding={0} cellSpacing={0} style={{ width: "100%", margin: "8px 0" }}>
      <tbody>
        <tr>
          <td style={rowLabel}>{label}</td>
          <td style={rowValue}>{value}</td>
        </tr>
      </tbody>
    </table>
  );
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const body: React.CSSProperties = {
  backgroundColor: "#f6f1e7",
  fontFamily: "Georgia, 'Times New Roman', serif",
  margin: 0,
  padding: "40px 16px",
};
const container: React.CSSProperties = {
  maxWidth: "560px",
  margin: "0 auto",
  background: "#fbf7ee",
  padding: "40px 32px",
  borderRadius: "8px",
};
const header: React.CSSProperties = {
  marginBottom: "32px",
};
const eyebrow: React.CSSProperties = {
  fontSize: "11px",
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: "#8a6a35",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  margin: 0,
};
const h1: React.CSSProperties = {
  fontSize: "32px",
  fontWeight: 400,
  lineHeight: 1.15,
  color: "#1a1f1c",
  margin: "12px 0 0",
};
const card: React.CSSProperties = {
  background: "#f6f1e7",
  borderRadius: "6px",
  padding: "20px 24px",
  marginBottom: "20px",
};
const rowLabel: React.CSSProperties = {
  fontSize: "10px",
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: "#8a8779",
  width: "120px",
  paddingRight: "16px",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};
const rowValue: React.CSSProperties = {
  fontSize: "16px",
  color: "#1a1f1c",
};
const dietary: React.CSSProperties = {
  background: "#ebdcc1",
  borderLeft: "3px solid #b08d57",
  padding: "16px 20px",
  marginBottom: "16px",
};
const dietaryLabel: React.CSSProperties = {
  fontSize: "10px",
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: "#8a6a35",
  margin: 0,
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};
const dietaryValue: React.CSSProperties = {
  fontSize: "15px",
  color: "#1a1f1c",
  margin: "6px 0 0",
};
const notesSection: React.CSSProperties = {
  padding: "0 4px 16px",
};
const italic: React.CSSProperties = {
  fontSize: "15px",
  color: "#5a5953",
  fontStyle: "italic",
  margin: "6px 0 0",
};
const hr: React.CSSProperties = {
  borderTop: "1px solid rgba(26,31,28,0.12)",
  margin: "24px 0",
};
const para: React.CSSProperties = {
  fontSize: "15px",
  color: "#2a2e2a",
  lineHeight: 1.6,
  margin: 0,
};
const link: React.CSSProperties = {
  color: "#8a6a35",
  textDecoration: "underline",
};
const footer: React.CSSProperties = {
  fontSize: "12px",
  color: "#8a8779",
  textAlign: "center",
  marginTop: "32px",
  fontStyle: "italic",
};
