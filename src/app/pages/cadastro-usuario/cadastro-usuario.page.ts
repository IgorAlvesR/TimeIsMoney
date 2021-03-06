import { OnInit, Component } from '@angular/core'
import { Funcionario } from 'src/app/Models/funcionario'
import { LoadingController, ToastController } from '@ionic/angular'
import { AutenticacaoService } from 'src/app/servicos/autenticacao.service'
import { Keyboard } from '@ionic-native/keyboard/ngx'
import { Usuario } from 'src/app/Models/usuario'

@Component({
  selector: 'app-cadastro-usuario',
  templateUrl: './cadastro-usuario.page.html',
  styleUrls: ['./cadastro-usuario.page.scss'],
})

export class CadastroUsuarioPage implements OnInit {

  public funcionario: Funcionario = {}
  public usuario: Usuario = {}
  private carregando: any
  private validadorEmail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

  
  constructor(
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private servicoAutenticacao: AutenticacaoService,
    private keyboard: Keyboard
  ) { }

  ngOnInit() {
    if(this.keyboard.isVisible){
      let content = document.getElementById('conteudo')
      content.style.backgroundColor = 'white'
    }
  }

  async registrar() {
    await this.presentLoading()
    this.funcionario.email = this.usuario.email
    try {
      if(this.funcionario.nome == "" || this.funcionario.salarioBruto == null || this.funcionario.funcao == ""
      || this.funcionario.email.length <=4 || this.funcionario.email.search("@") == 1 ||
      this.funcionario.email.search(" ") == 1 ){
        this.presentToast('Preencha todos os campos corretamente!')
      }else {
        await this.servicoAutenticacao.registrarFuncionario(this.funcionario)
        await this.servicoAutenticacao.registrarUsuario(this.usuario)
      }
      
    } catch (error) {
      let mensagem: string
      switch (error.code) {
        case 'auth/argument-error':
          mensagem = 'Preencha todos os campos!'
          break
        case 'auth/email-already-in-use':
          mensagem = 'Email em uso!'
          break
        case 'auth/invalid-email':
          mensagem = 'Email inválido!'
          break
        case 'auth/weak-password':
          mensagem = 'Senha inválida!'
          break
        default:
          alert(error)
          mensagem = 'Erro ao cadastrar funcionário, verifique seus dados e sua conexão'
          break
      }

      this.presentToast(mensagem)

    } finally {
      this.carregando.dismiss()
    }
  }

  async presentLoading() {
    this.carregando = await this.loadingCtrl.create({ message: 'Por favor, aguarde...'})
    return this.carregando.present()
  }

  async presentToast(mensagem: string) {
    const toast = await this.toastCtrl.create({ message: mensagem, duration: 2000 })
    toast.present()
  }


}
