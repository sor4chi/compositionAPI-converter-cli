<template>
<el-container v-if="consultation != null">
  <Header :data="activeindex" :isMobile="isMobile" />
  <el-container>
    <el-header>
      <Breadcrumb :data="breadcrumb_name" />
    </el-header>
    <el-main>
      <el-row>
        <el-col :span="11">
          <OptionButton
            :consultation="consultation"
            :histories="histories"
            :order="order"
            @updateConsultationObject="updateConsultationObject"
            @reload="getConsultationHistories"
            dusk="consultation-detail-option-button"
          />
          <CustomerDetail
            :consultation="consultation"
            @updateConsultationObject="updateConsultationObject"
          />
        </el-col>
        <el-col :span="12" :offset="1">
          <el-row>
            <el-col :span="16" v-if="histories.length">
              <OrderSelect
                :order="order"
                :histories="histories"
                @changeOrder="changeOrder"
              />
            </el-col>
            <el-col :span="8" :offset="histories.length ? 0 : 16">
              <div
                class="create_todo_div"
                @click="consultationTicketModalVisible = true"
              >
                <li class="el-icon-circle-plus-outline"></li>
                <span class="text">チケット</span>
              </div>
            </el-col>
            <ConsultationTicketList
              :consultationTickets="consultation.consultation_tickets"
              @updateConsultationTickets="updateConsultationTickets"
            />
          </el-row>
          <el-row style="margin-top: 10px">
            <ConsultationTabs
              v-if="staff.role == 'admin'"
              :consultation="consultation"
              :histories="histories"
              @updateConsultationObject="updateConsultationObject"
              @reload="getConsultationHistories"
            />
            <ConsultationTabInfo
              v-else-if="staff.role == 'expert'"
              :consultation="consultation"
            />
          </el-row>
          <el-drawer
            :visible.sync="consultationTicketModalVisible"
            :with-header="true"
            size="50%"
          >
            <ConsultationTicketListModal
              v-if="consultationTicketModalVisible"
              @updateConsultationTickets="updateConsultationTickets"
              :is_consultation="true"
              :display_size="'medium'"
              :selected_consultation_id="consultation.id"
              :staff="staff"
              :completion_condition_list="completion_condition_list"
              :creation_condition_list="creation_condition_list"
              ref="half_modal"
            />
          </el-drawer>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</el-container>

</template>
<script>
import { defineComponent, ref, watch, onMounted } from "@vue/composition-api";
import Header from "../Common/Header.vue";
import Breadcrumb from "../Common/Breadcrumb.vue";
import OptionButton from "./Detail/OptionButton.vue";
import OrderSelect from "./Detail/OrderSelect.vue";
import CustomerDetail from "@/components/Common/CustomerDetail.vue";
import ConsultationTabs from "./Detail/ConsultationTabs.vue";
import ConsultationTabInfo from "./Detail/ConsultationTabs/ConsultTabCards/MainContent.vue";
import ConsultationTicketListModal from "@/components/Common/ConsultationTicketListModal/Index.vue";
import ConsultationTicketList from "@/components/Common/ConsultationTicketList.vue";
import { ConsultationService } from "../../api";
export default defineComponent({ components: {
        Header,
        Breadcrumb,
        OptionButton,
        OrderSelect,
        CustomerDetail,
        ConsultationTabs,
        ConsultationTabInfo,
        ConsultationTicketListModal,
        ConsultationTicketList
    }, setup(_props, ctx) { const isMobile = ref(true); const consultation = ref(null); const displayId = ref(null); const activeindex = ref({ param1: 1 }); const breadcrumb_name = ref(null); const consultationTicketModalVisible = ref(false); const order = ref(null); const histories = ref([]); const updateConsultationObject = (object) => {
        axios.get("/consultation_logs/logs", {
            params: {
                consultation_id: consultation.value.id
            }
        }).then((res) => {
            consultation.value.logs = res.data;
            consultation.value = object;
        });
    }; const getAuthUser = async () => {
        const response = await axios.get("/line_staffs/get_auth_user");
        staff = response.data;
    }; const getIsMobile = () => {
        axios.get("/api/general/getIsMobile").then((res) => {
            isMobile.value = res.data.isMobile;
        });
    }; const getConsultation = () => {
        ConsultationService.get.detail(ctx.root.$route.params.id).then((res) => {
            consultation.value = res.data.data;
            if (!consultation.value) {
                return (location.href = "/not_found");
            }
            breadcrumb_name.value = {
                param1: "\u30E6\u30FC\u30B6\u30FC\u7BA1\u7406",
                param2: consultation.value.name,
                url1: "/",
                name: staff.family_name
            };
        }).catch((err) => {
            console.error(`[${err.response.status}] ${err.response.data.message}`);
            alert(err.response.data.message);
            location.href = "/";
        });
    }; const getConsultationHistories = async () => {
        try {
            const response = await axios.get(`/consultations/${displayId.value}/history`);
            histories.value = response.data.data;
            if (ctx.root.$route.query.order > 0 && ctx.root.$route.query.order <= histories.value.length) {
                order.value = Number(ctx.root.$route.query.order);
            }
            else {
                order.value = histories.value.length || 1;
                ctx.root.$router.push({ query: { order: order.value } });
            }
        }
        catch (err) {
            console.error(`[${err.response.status}] ${err.response.data.message}`);
        }
    }; const getCreationConditionList = () => {
        return axios.get("/consultation_tickets/creation_condition_list").then((res) => {
            creation_condition_list = res.data;
        });
    }; const getCompletionConditionList = () => {
        return axios.get("/consultation_tickets/completion_condition_list").then((res) => {
            completion_condition_list = res.data;
        });
    }; const changeOrder = (order) => {
        ctx.root.$router.push({ query: { order } });
    }; const updateConsultationTickets = (array) => {
        consultation.value.consultation_tickets = array;
    }; watch($route, (to) => {
        order.value = Number(to.query.order);
    }); onMounted(async () => {
        displayId.value = ctx.root.$route.params.id;
        await getAuthUser();
        getConsultation();
        getConsultationHistories();
        getCreationConditionList();
        getCompletionConditionList();
    }); return { isMobile, consultation, displayId, activeindex, breadcrumb_name, consultationTicketModalVisible, order, histories, updateConsultationObject, getAuthUser, getIsMobile, getConsultation, getConsultationHistories, getCreationConditionList, getCompletionConditionList, changeOrder, updateConsultationTickets }; } });

</script>
<style scoped>

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}
.clearfix:after {
  clear: both;
}

.expert-main-row {
  margin-top: 4px;
}
.user-info-main-row {
  margin-top: 8px;
}
.user-data-div {
  margin-top: 8px;
}
.candidate-time-wrapper {
  padding-top: 20px;
}
.candidate-time-wrapper > div.time-content {
  display: flex;
  justify-content: center;
}
.candidate-time-wrapper > div.time-content:not(:last-child) {
  margin-bottom: 5px;
}
.time-content > div:first-child {
  width: 30%;
  text-align: center;
  padding-top: 6px;
}
.time-content > div:last-child {
  width: 50%;
}
.time-warning {
  color: #ff4040;
  padding-top: 20px;
  text-align: center;
}
.cancel-submit-flag.el-input.is-disabled .el-input__inner {
  color: black;
}
.report-info-row {
  margin-top: 15px;
}
.create_todo_div {
  border: 1px solid #409eff;
  display: block;
  margin: 0 0 36px auto;
  width: 100px;
  font-size: 16px;
  padding-right: 6px;
}
</style>