import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <CardTitle className="text-2xl">Algo salió mal</CardTitle>
            <CardDescription>
              {params?.error
                ? `Código de error: ${params.error}`
                : 'No pudimos completar la autenticación. El enlace puede haber expirado.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/auth/login" className="text-sm text-orange-500 font-semibold hover:underline">
              Volver a intentar
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
