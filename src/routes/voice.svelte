<script>
  import Wrapper from "./wrapper.svelte";
  import GeneratedQuery from "../components/generatedQuery.svelte";

  import {
    appState,
    startRecorder,
    stopRecorder,
    recorderStatus,
  } from "../state/store";
  import "../styles/pages.css";

  let state;
  let recorderState;

  appState.subscribe((value) => {
    state = value;
  });

  recorderStatus.subscribe((status) => (recorderState = status));
</script>

<Wrapper>
  <section class="my-5" >
    <p class="text-center">
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Soluta, illum!
    </p>
  </section>

  <section>
    <GeneratedQuery />
  </section>

  <section>
    <div class="my-2">
      {#if recorderState.status === "STOPPED"}
        <div class="align-center">
          <button class="custom-btn flex" on:click={() => startRecorder()}>
            Record Voice Input

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
      {:else if recorderState.status === "GENERATING_SEARCH_QUERY"}
        <div class="align-center">
          <button class="custom-btn" disabled>
            Generating Search Query ...

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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      {:else}
        <div class="align-center">
          <button class="custom-btn flex" on:click={() => stopRecorder()}>
            Stop Recording Voice Input

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
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          </button>
        </div>
      {/if}

      {#if recorderState.hasError === "ERROR_GENERATING"}
        <p class="error-text">Error Generating Code Search Query</p>
      {/if}
    </div>
  </section>
</Wrapper>