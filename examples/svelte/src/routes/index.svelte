<script>
  import { Lines, Dots } from '../../../../src/'
</script>

<h1>@small-tech/spinners Svelte example</h1>

<Lines size='3em' /> <Dots size='3em' colour='white'/>

<br><br>

<details open>
  <summary>View Source</summary>
  <pre><code>&lt;script&gt;
  import &lbrace; Lines, Dots &rbrace; from '../../../../src/'
&lt;/script&gt;

&lt;h1&gt;@small-tech/spinners Svelte example&lt;/h1&gt;

&lt;Lines size='3em' /&gt; &lt;Dots size='3em' colour='white' /&gt;
</code></pre>
</details>

<style>
  :global(svg) {
    border: 1px solid black;
  }

  :global(svg:nth-of-type(2)) {
    background: black;
  }
</style>
