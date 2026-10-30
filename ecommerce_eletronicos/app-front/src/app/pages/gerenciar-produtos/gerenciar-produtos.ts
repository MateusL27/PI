import { CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { DadosProduto, Produto } from '../../models/produto';

const novoProdutoVazio = (): DadosProduto => ({
  nome: '',
  preco: 0,
  quantidade: 0,
  categoria: '',
  imagem: '',
});

@Component({
  selector: 'app-gerenciar-produtos',
  standalone: true,
  imports: [CurrencyPipe, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './gerenciar-produtos.html',
  styleUrl: './gerenciar-produtos.css',
})
export class GerenciarProdutos implements OnInit {
  produtos: Produto[] = [];
  formulario = novoProdutoVazio();
  produtoEmEdicao: string | null = null;
  mensagem = '';
  mensagemErro = '';
  carregando = false;
  salvando = false;

  private readonly http = inject(HttpClient);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.carregarProdutos();
  }

  carregarProdutos(): void {
    this.carregando = true;
    this.mensagemErro = '';

    this.http.get<Produto[]>('http://localhost:3000/produtos').subscribe({
      next: (produtos) => {
        this.produtos = produtos;
        this.carregando = false;
        this.changeDetector.markForCheck();
      },
      error: (erro: unknown) => {
        console.error('Não foi possível carregar os produtos:', erro);
        this.mensagemErro = 'Não foi possível carregar os produtos. Verifique se o json-server está iniciado.';
        this.carregando = false;
        this.changeDetector.markForCheck();
      },
    });
  }

  salvar(): void {
    this.mensagem = '';
    this.mensagemErro = '';
    this.salvando = true;
    const estaEditando = this.produtoEmEdicao !== null;
    const dados: DadosProduto = {
      ...this.formulario,
      nome: this.formulario.nome.trim(),
      categoria: this.formulario.categoria.trim(),
    };

    const requisicao = this.produtoEmEdicao
      ? this.http.put<Produto>(`http://localhost:3000/produtos/${this.produtoEmEdicao}`, dados)
      : this.http.post<Produto>('http://localhost:3000/produtos', dados);

    requisicao.subscribe({
      next: () => {
        this.cancelarEdicao();
        this.mensagem = estaEditando ? 'Produto atualizado.' : 'Produto cadastrado.';
        this.salvando = false;
        this.changeDetector.markForCheck();
        this.carregarProdutos();
      },
      error: (erro: unknown) => {
        console.error('Não foi possível salvar o produto:', erro);
        this.mensagemErro = 'Não foi possível salvar o produto. Tente novamente.';
        this.salvando = false;
        this.changeDetector.markForCheck();
      },
    });
  }

  editar(produto: Produto): void {
    this.produtoEmEdicao = produto.id;
    this.formulario = {
      nome: produto.nome,
      preco: produto.preco,
      quantidade: produto.quantidade,
      categoria: produto.categoria,
      imagem: produto.imagem,
    };
    this.mensagem = '';
    this.mensagemErro = '';
  }

  excluir(produto: Produto): void {
    if (!window.confirm(`Deseja excluir "${produto.nome}"?`)) {
      return;
    }

    this.mensagem = '';
    this.mensagemErro = '';
    this.http.delete<void>(`http://localhost:3000/produtos/${produto.id}`).subscribe({
      next: () => {
        this.mensagem = 'Produto excluído.';
        this.changeDetector.markForCheck();
        this.carregarProdutos();
      },
      error: (erro: unknown) => {
        console.error('Não foi possível excluir o produto:', erro);
        this.mensagemErro = 'Não foi possível excluir o produto. Tente novamente.';
        this.changeDetector.markForCheck();
      },
    });
  }

  cancelarEdicao(): void {
    this.produtoEmEdicao = null;
    this.formulario = novoProdutoVazio();
  }

  sair(): void {
    sessionStorage.removeItem('admLogado');
    this.router.navigate(['/login']);
  }
}
