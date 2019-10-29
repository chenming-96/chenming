<template> 
  <div class="app-container">
    <el-card class="filter-container" shadow="never">
      <div>
        <i class="el-icon-search"></i>
        <span>筛选搜索</span>
        <el-button
          style="float:right"
          type="primary"
          @click="handleSearchList()"
          size="small">
          查询搜索
        </el-button>
        <el-button
          style="float:right;margin-right: 15px"
          @click="handleResetSearch()"
          size="small">
          重置
        </el-button>
      </div>
      <div style="margin-top: 15px">
        <el-form :inline="true" :model="listQuery" size="small" label-width="140px">
          <el-form-item label="视频名称：">
            <el-input v-model="listQuery.keyword" class="input-width" placeholder="视频名称" clearable></el-input>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets"></i>
      <span>数据列表</span>
      <el-button size="mini" class="btn-add" @click="handleAdd()" style="margin-left: 20px">视频上传</el-button>
      <!-- <el-button size="mini" class="btn-add" @click="handleShowSessionList()">秒杀时间段列表</el-button> -->
    </el-card>
    <div class="table-container">
      <el-table ref="flashTable"
                :data="list"
                style="width: 100%;"
                v-loading="listLoading" border>
        <el-table-column type="selection" width="60" align="center"></el-table-column>
        <el-table-column label="编号" width="100" align="center">
          <template slot-scope="scope">{{scope.row.id}}</template>
        </el-table-column>
        <el-table-column label="活动标题" align="center">
          <template slot-scope="scope">{{scope.row.title}}</template>
        </el-table-column>
        <el-table-column label="活动状态" width="140" align="center">
          <template slot-scope="scope">{{scope.row |formatActiveStatus}}</template>
        </el-table-column>
        <el-table-column label="开始时间" width="140" align="center">
          <template slot-scope="scope">{{scope.row.startDate | formatDate}}</template>
        </el-table-column>
        <el-table-column label="结束时间" width="140" align="center">
          <template slot-scope="scope">{{scope.row.endDate | formatDate}}</template>
        </el-table-column>
        <el-table-column label="上线/下线" width="200" align="center">
          <template slot-scope="scope">
            <el-switch
              @change="handleStatusChange(scope.$index, scope.row)"
              :active-value="1"
              :inactive-value="0"
              v-model="scope.row.status">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template slot-scope="scope">
            <el-button size="mini"
                       type="text"
                       @click="handleSelectSession(scope.$index, scope.row)">设置商品
            </el-button>
            <el-button size="mini"
                       type="text"
                       @click="handleUpdate(scope.$index, scope.row)">
              编辑
            </el-button>
            <el-button size="mini"
                       type="text"
                       @click="handleDelete(scope.$index, scope.row)">删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="pagination-container">
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        layout="total, sizes,prev, pager, next,jumper"
        :current-page.sync="listQuery.pageNum"
        :page-size="listQuery.pageSize"
        :page-sizes="[5,10,15]"
        :total="total">
      </el-pagination>
    </div>
    <el-dialog
      title="添加视频"
      :visible.sync="dialogVisible"
      width="40%">
      <el-form :model="flashPromotion"
               ref="flashPromotionForm"
               label-width="150px" size="small">
        <el-form-item label="视频标题：">
          <el-input v-model="flashPromotion.title" style="width: 250px"></el-input>
        </el-form-item>
           <el-form-item label="上传视频：">
        <el-upload class="avatar-uploader el-upload--text"
                               :action="uploadUrl" 
                               :show-file-list="false"
                               accept=".mp4"  
                               :on-success="handleVideoSuccess"  
                               :before-upload="beforeUploadVideo" 
                               :on-progress="uploadVideoProcess"> 
                        <!-- <video v-if="this.flashPromotion.showVideoPath !='' && !videoFlag"  
                        this.global.company.showVideoPath
                                :src="this.flashPromotion.showVideoPath" 
                               class="avatar video-avatar"
                               controls="controls">您的浏览器不支持视频播放</video>  -->
<!--                             
                         <i v-else-if="this.flashPromotion.showVideoPath =='' && !videoFlag"
                           class="el-icon-plus avatar-uploader-icon"></i>    --> -->
                           
                        <el-progress v-if="videoFlag == true"
                                     type="circle"
                                     :percentage="videoUploadPercent"
                                     style="margin-top:30px;"></el-progress>
                        <el-button class="video-btn"
                                   slot="trigger"
                                   size="small"
                                   v-if="isShowUploadVideo"
                                   type="primary">选取文件</el-button>
                    </el-upload>
                       </el-form-item>
                    <P v-if="isShowUploadVideo"
                       class="text">请保证视频格式正确，且不超过20M</P>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false" size="small">取 消</el-button>
        <el-button type="primary" @click="handleDialogConfirm()" size="small">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
  import {fetchList, updateStatus, deleteFlash, createFlash, updateFlash} from '@/api/flash';
  import {formatDate} from '@/utils/date';

  const defaultListQuery = {
    pageNum: 1,
    pageSize: 5,
    keyword: null
  };
  const defaultFlashPromotion = {
    id: null,
    title: null,
    startDate: null,
    endDate: null,
    status: 0
  };
  export default {
    name: 'flashPromotionList',
    data() {
      return {
        listQuery: Object.assign({}, defaultListQuery),
        list: null,
        total: null,
        listLoading: false,
        dialogVisible: false,
        flashPromotion: Object.assign({}, defaultFlashPromotion),
        isEdit: false,
        uploadUrl:"",//你要上传视频到你后台的地址
        videoFlag:false , //是否显示进度条
     
        videoUploadPercent:"",//进度条的进度，
           isShowUploadVideo:false ,//显示上传按钮
		
      }
    },
    created() {
      this.getList();
    },
    filters: {
      formatActiveStatus(row) {
        let nowTime = new Date().getTime();
        if (nowTime >= row.startDate && nowTime <= row.endDate) {
          return '活动进行中';
        } else if (nowTime > row.endDate) {
          return '活动已结束';
        } else {
          return '活动未开始';
        }
      },
      formatDate(time) {
        if (time == null || time === '') {
          return 'N/A';
        }
        let date = new Date(time);
        return formatDate(date, 'yyyy-MM-dd')
      }
    },
    methods: {
      handleResetSearch() {
        this.listQuery = Object.assign({}, defaultListQuery);
      },
      handleSearchList() {
        this.listQuery.pageNum = 1;
        this.getList();
      },
      handleSizeChange(val) {
        this.listQuery.pageNum = 1;
        this.listQuery.pageSize = val;
        this.getList();
      },
      handleCurrentChange(val) {
        this.listQuery.pageNum = val;
        this.getList();
      },
      handleAdd() {
        this.dialogVisible = true;
        this.isEdit = false;
        this.flashPromotion = Object.assign({},defaultFlashPromotion);
      },
      handleShowSessionList() {
        this.$router.push({path: '/sms/flashSession'})
      },
      //上传前回调
	beforeUploadVideo (file) {
            const isLt20M = file.size / 1024 / 1024 < 20;
            if (['video/mp4'].indexOf(file.type) == -1) { //'video/ogg', 'video/flv', 'video/avi', 'video/wmv', 'video/rmvb'
                this.$message.error('请上传正确的视频格式');
                return false;
            }
            if (!isLt20M) {
                this.$message.error('上传视频大小不能超过20MB哦!');
                return false;
            }
            this.isShowUploadVideo = false;
        },
	//进度条
	uploadVideoProcess (event, file, fileList) {
            this.videoFlag = true;
            this.videoUploadPercent = file.percentage.toFixed(0) * 1;
        },
	
	//上传成功回调
	handleVideoSuccess (res, file) {
            this.isShowUploadVideo = true;
            this.videoFlag = false;
            this.videoUploadPercent = 0;
            if (res.errorCode == "00") {
                this.flashPromotion.showVideoPath = res.sprbody.urlAddress;
                this.videoForm.showVideoPath = res.data.uploadUrl;
            } else {
                this.$message.error('视频上传失败，请重新上传！');
            }
        },
      handleStatusChange(index, row) {
        this.$confirm('是否要修改该状态?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          updateStatus(row.id, {status: row.status}).then(response => {
            this.$message({
              type: 'success',
              message: '修改成功!'
            });
          });
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '取消修改'
          });
          this.getList();
        });
      },
      handleDelete(index, row) {
        this.$confirm('是否要删除该活动?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteFlash(row.id).then(response => {
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
            this.getList();
          });
        });
      },
      handleUpdate(index, row) {
        this.dialogVisible = true;
        this.isEdit = true;
        this.flashPromotion = Object.assign({},row);
      },
      handleDialogConfirm() {
        this.$confirm('是否要确认?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          if (this.isEdit) {
            updateFlash(this.flashPromotion.id,this.flashPromotion).then(response => {
              this.$message({
                message: '修改成功！',
                type: 'success'
              });
              this.dialogVisible =false;
              this.getList();
            })
          } else {
            createFlash(this.flashPromotion).then(response => {
              this.$message({
                message: '添加成功！',
                type: 'success'
              });
              this.dialogVisible =false;
              this.getList();
            })
          }
        })
      },
      handleSelectSession(index,row){
        this.$router.push({path:'/sms/selectSession',query:{flashPromotionId:row.id}})
      },
      getList() {
        this.listLoading = true;
        fetchList(this.listQuery).then(response => {
          this.listLoading = false;
          this.list = response.data.list;
          this.total = response.data.total;
        });
      }
    }
  }
</script>
<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
.video-avatar {
  width: 400px;
  height: 200px;
}
</style>


