import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface VerificationEmailProps {
  verificationUrl?: string
}

export const VerificationEmail = ({
  verificationUrl = 'https://stylesnap.com/auth/callback',
}: VerificationEmailProps) => (
  <Html>
    <Head />
    <Preview>验证您的 StyleSnap 邮箱</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>欢迎使用 StyleSnap</Heading>
        <Text style={text}>
          感谢注册 StyleSnap！点击下方链接验证您的邮箱：
        </Text>
        <Section style={buttonContainer}>
          <Button style={button} href={verificationUrl}>
            验证邮箱
          </Button>
        </Section>
        <Text style={footer}>
          如非本人操作，请忽略此邮件。
          <br />
          此链接 24 小时后失效。
        </Text>
      </Container>
    </Body>
  </Html>
)

export default VerificationEmail

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  marginTop: '40px',
  marginBottom: '40px',
  padding: '20px 0',
  borderRadius: '8px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
}

const h1 = {
  color: '#667eea',
  fontSize: '28px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '30px 0',
}

const text = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '26px',
  textAlign: 'center' as const,
  marginBottom: '30px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  marginBottom: '30px',
}

const button = {
  backgroundColor: '#667eea',
  borderRadius: '5px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 30px',
}

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '22px',
  textAlign: 'center' as const,
  borderTop: '1px solid #e1e1e1',
  paddingTop: '20px',
  marginTop: '30px',
  padding: '0 20px 20px',
}
