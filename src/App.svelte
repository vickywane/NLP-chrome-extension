<script>
  import Home from "./routes/Home.svelte";
  import Text from "./routes/text.svelte";
  import Voice from "./routes/voice.svelte";
  import { appView } from "./state/app-view";
  import Nav from "./components/Nav.svelte";
  import Footer from "./components/Footer.svelte";

  let view;

  appView.subscribe((currentView) => {
    view = currentView;
  });
</script>

<div class="container" >
  <Nav />
  <div>
    {#if view === "HOMESCREEN"}
      <Home />
    {:else if view === "TEXTSCREEN"}
      <Text />
    {:else if view === "VOICESCREEN"}
      <Voice />
    {/if}
  </div>
  <Footer />
</div>

<style>
  .container {
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    height: 500px;
  }
</style>