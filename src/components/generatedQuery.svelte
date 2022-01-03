<script>
    import "../styles/components.css";

    let copied = false;
</script>

<div>
    <div class="align-center">
        <div class="search-query-ctn">
            <div>
                {#if !copied}
                    <button
                        on:click={() => (copied = !copied)}
                        class="query-btn flex"
                    >
                        Copy Search Query

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
                                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                            />
                        </svg>
                    </button>
                {:else}
                    <button
                        on:click={() => (copied = !copied)}
                        class="query-btn flex"
                    >
                        Copied!

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
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                            />
                        </svg>
                    </button>
                {/if}
            </div>
            <br />
            <div class="align-center">
                <code> for() </code>
            </div>

            <!-- <button class="query-btn">
                Launch Sourcegraph
            </button> -->
        </div>
    </div>
    <br />
    <p class="text-center info-text">Wrong Search Query Generated?</p>
    <p class="text-center">Try Query From Search Statement</p>
</div>

<style>
    .query-btn {
        font-size: 0.85rem;
        padding: 0.5rem 1rem;
        /* border-radius: 5px; */
        background-color: #cfcfcf;
    }
</style>
