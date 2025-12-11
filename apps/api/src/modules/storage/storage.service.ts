import { Injectable, Inject } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { LoggerService } from '../logger/logger.service'
import * as fs from 'fs/promises'
import * as path from 'path'

@Injectable()
export class StorageService {
  private readonly uploadsDir: string

  constructor(
    @Inject(ConfigService) private configService: ConfigService,
    @Inject(LoggerService) private logger: LoggerService,
  ) {
    this.uploadsDir = this.configService.get('UPLOADS_DIR') || './uploads'
  }

  async saveFile(
    userId: string,
    analysisId: string,
    fileName: string,
    content: Buffer,
  ): Promise<string> {
    const dirPath = path.join(this.uploadsDir, userId, analysisId)
    const filePath = path.join(dirPath, fileName)

    try {
      // Create directory if it doesn't exist
      await fs.mkdir(dirPath, { recursive: true })

      // Write file
      await fs.writeFile(filePath, content)

      this.logger.log(`File saved: ${filePath}`)
      return filePath
    } catch (error) {
      this.logger.error(`Failed to save file: ${filePath}`, error)
      throw error
    }
  }

  async getFile(filePath: string): Promise<Buffer> {
    try {
      return await fs.readFile(filePath)
    } catch (error) {
      this.logger.error(`Failed to read file: ${filePath}`, error)
      throw error
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath)
      this.logger.log(`File deleted: ${filePath}`)
    } catch (error) {
      this.logger.error(`Failed to delete file: ${filePath}`, error)
      throw error
    }
  }

  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }

  // Clean up analysis directory (when analysis is deleted)
  async deleteAnalysisFiles(userId: string, analysisId: string): Promise<void> {
    const dirPath = path.join(this.uploadsDir, userId, analysisId)

    try {
      await fs.rm(dirPath, { recursive: true, force: true })
      this.logger.log(`Directory deleted: ${dirPath}`)
    } catch (error) {
      this.logger.error(`Failed to delete directory: ${dirPath}`, error)
    }
  }
}
