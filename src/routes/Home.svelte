<script>
  import "../styles/pages.css";
  import Wrapper from "./wrapper.svelte";
  import { handleAppView } from "../state/app-view";
</script>

<Wrapper>
  <div>
    <section class="my-5">
      <p class="text-center">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Soluta, illum!
      </p>
    </section>

    <section>
      <div class="align-center">
        <button
          class="custom-btn"
          on:click={() => handleAppView({ view: "VOICESCREEN" })}
        >
          Generate Search Query From Voice Input
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 ml-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        </button>
      </div>

      <br />

      <div class="align-center">
        <button
          class="custom-btn"
          on:click={() => handleAppView({ view: "TEXTSCREEN" })}
        >
          Generate Search Query From Text Input

          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 ml-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </button>
      </div>
    </section>
  </div>
</Wrapper>
