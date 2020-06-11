<template>
  <div>
    <v-container v-if="loading" fluid>
      <v-row align="center" justify="center">
        <v-col>
          <div>
            <img src="@/assets/loading.svg" />
          </div>
        </v-col>
      </v-row>
    </v-container>
    <v-data-table v-else :headers="headers" :items="items" class="elevation-1">
      <template v-slot:top>
        <v-toolbar flat color="white">
          <v-toolbar-title>Admin Panel</v-toolbar-title>
          <v-spacer></v-spacer>

          <v-dialog v-model="dialog" max-width="500px">
            <template v-slot:activator="{ on, attrs }">
              <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on"
                >New Item</v-btn
              >
            </template>
            <v-form ref="myForm" v-model="valid">
              <v-card>
                <v-card-title>
                  <span class="headline">{{ formTitle }}</span>
                </v-card-title>

                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col cols="12" sm="6" md="4">
                        <v-text-field
                          v-model="editedItem.name"
                          :disabled="editedIndex !== -1"
                          :readonly="editedIndex !== -1"
                          label="Item name"
                          :rules="required"
                        />
                      </v-col>
                      <v-col cols="12" sm="6" md="4">
                        <v-text-field
                          v-model="editedItem.price"
                          :disabled="editedIndex !== -1"
                          :readonly="editedIndex !== -1"
                          type="number"
                          label="Price"
                          :rules="required"
                        />
                      </v-col>
                      <v-col cols="12" sm="6" md="4">
                        <v-text-field
                          v-model="editedItem.unit"
                          :disabled="editedIndex !== -1"
                          :readonly="editedIndex !== -1"
                          type="number"
                          label="Unit"
                          :rules="required"
                        ></v-text-field>
                      </v-col>
                    </v-row>
                    <v-row v-if="editedIndex !== -1">
                      <v-col cols="12">
                        <v-file-input
                          label="Upload attachment"
                          accept="image/*"
                          show-size
                          @change="handleFileUpload"
                        />
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="close">
                    Cancel
                  </v-btn>
                  <v-btn color="blue darken-1" text @click="save">Save</v-btn>
                </v-card-actions>
              </v-card>
            </v-form>
          </v-dialog>
        </v-toolbar>
      </template>
      <template v-slot:item.attachmentUrl="{ item }">
        <span v-if="!item.attachmentUrl">N/A</span>
        <img v-else :src="item.attachmentUrl" class="attachment" />
      </template>
      <template v-slot:item.actions="{ item }">
        <v-icon small class="mr-2" @click="editItem(item)">mdi-pencil</v-icon>
        <v-icon small @click="handleDeleteItem(item)">mdi-delete</v-icon>
      </template>
      <template v-slot:no-data>No data</template>
    </v-data-table>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  data() {
    return {
      valid: false,
      dialog: false,
      chosenFile: null,
      required: [(v) => !!v || "This field is required"],
      headers: [
        { text: "Name", value: "name" },
        { text: "Price", value: "price" },
        { text: "Unit", value: "unit" },
        { text: "Atachment", value: "attachmentUrl" },
        { text: "Actions", value: "actions", sortable: false },
      ],
      editedIndex: -1,
      editedItem: {
        inventoryId: "",
        name: "",
        price: 0,
        unit: 0,
      },
      defaultItem: {
        inventoryId: "",
        name: "",
        price: 0,
        unit: 0,
      },
    };
  },
  computed: {
    ...mapState({
      items: (state) => state.items,
      loading: (state) => state.loading,
      token: (state) => state.token,
    }),
    formTitle() {
      return this.editedIndex === -1 ? "New Item" : "Edit Item";
    },
  },
  watch: {
    dialog(val) {
      val || this.close();
    },
  },
  async mounted() {
    if (!this.token) {
      const token = localStorage.getItem("id_token");
      if (token) this.$store.commit("setToken", token);
    }
    await this.fetchItems();
  },
  methods: {
    ...mapActions({
      fetchItems: "fetchItems",
      deleteItem: "deleteItem",
      updateItemUrl: "updateItemUrl",
      createItem: "createItem",
    }),
    editItem(item) {
      this.editedIndex = this.items.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    async handleDeleteItem(item) {
      if (confirm("Are you sure you want to delete this item?"))
        await this.deleteItem(item.inventoryId);
    },
    handleFileUpload(file) {
      this.chosenFile = file;
    },
    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },
    async save() {
      const form = this.$refs.myForm;
      if (form.validate()) {
        if (this.editedIndex > -1) {
          // update attachment url
          await this.updateItemUrl({
            inventoryId: this.editedItem.inventoryId,
            file: this.chosenFile,
          });
        } else {
          // create
          await this.createItem(this.editedItem);
        }
        this.close();
      }
    },
  },
};
</script>

<style scoped>
.attachment {
  border: 1px solid #888888;
  width: 100px;
}
</style>
