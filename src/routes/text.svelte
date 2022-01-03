<script>
    import Wrapper from "./wrapper.svelte";
    import {
        submitSearchSentence,
        searchStatus, textSearchState
    } from "../state/text-search-store";
    import "../styles/pages.css";

    let searchSentence;
    let currentSearchStatus;

    searchStatus.subscribe((state) => currentSearchStatus = state );
</script>

<Wrapper>
    <div>
        <section class="my-5">
            <p class="text-center">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Soluta,
                illum!
            </p>

        </section>

        <section>
            <form
                class="my-5"
                on:submit={(e) => {
                    submitSearchSentence(searchSentence);
                    e.preventDefault();
                }}
            >
                <div class="align-center">
                    <input
                        class="custom-input"
                        placeholder="Make a search intended sentence"
                        bind:value={searchSentence}
                    />
                </div>
                <br />

                <div class="align-center">
                    {#if currentSearchStatus.status === "GENERATING_SEARCH_RESULT"}
                        <button
                            type="submit"
                            class="custom-btn"
                            on:click={() => {}}
                        >
                            Generating Code Search Query
                        </button>
                    {:else}
                        <button
                            type="submit"
                            class="custom-btn"
                            on:click={() => {}}
                        >
                            Generate Code Search Query
                        </button>
                    {/if}
                </div>
            </form>
        </section>
    </div>
</Wrapper>
