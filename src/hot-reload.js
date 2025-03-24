if (import.meta.hot) {
  import.meta.hot.accept(() => {
    console.log('Hot reloading...');
    window.location.reload();
  });
}
