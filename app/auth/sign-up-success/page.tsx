import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MailCheck } from 'lucide-react'
import Link from 'next/link'

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <MailCheck className="w-6 h-6 text-orange-500" />
            </div>
            <CardTitle className="text-2xl">¡Revisa tu correo!</CardTitle>
            <CardDescription>
              Te registraste con éxito. Te enviamos un enlace de confirmación a tu correo —
              ábrelo para activar tu cuenta antes de iniciar sesión.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/auth/login" className="text-sm text-orange-500 font-semibold hover:underline">
              Volver a iniciar sesión
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
