import { login, signup } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>
}) {
    const { error } = await searchParams

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">EducaCivil</h1>
                    <p className="mt-2 text-muted-foreground">Panel de Administración</p>
                </div>

                <div className="rounded-xl border border-border/50 bg-card p-8 shadow-lg">
                    <h2 className="text-2xl font-semibold mb-6">Iniciar Sesión</h2>

                    <form className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                required
                                placeholder="admin@educacivil.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                            />
                        </div>

                        {error && (
                            <p className="text-sm font-medium text-destructive">{error}</p>
                        )}

                        <div className="flex flex-col gap-3 pt-4">
                            <Button
                                formAction={login}
                                className="w-full"
                            >
                                Ingresar
                            </Button>
                            <Button
                                formAction={signup}
                                variant="outline"
                                className="w-full"
                            >
                                Crear cuenta (Solo para demo)
                            </Button>
                        </div>
                    </form>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                    EducaCivil — Formación Ciudadana con IA
                </p>
            </div>
        </div>
    )
}
