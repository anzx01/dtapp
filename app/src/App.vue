<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
onLaunch(() => {
  console.log("DCA Plan App Launch");
});
onShow(() => {
  console.log("DCA Plan App Show");
});
onHide(() => {
  console.log("DCA Plan App Hide");
});
</script>
<style>
page {
  background: #f6f2e9;
}
</style>
