---
tags:
  - Apache
  - ApachePOI
---

# Apache POI 使用指南

## 1 简介

[Apache POI](https://poi.apache.org/) 是一个强大的 Java 库，用于读写 Microsoft Office 格式的文件。它支持 Excel、Word、PowerPoint 等多种文件格式，是企业级应用中常用的工具。

## 2 安装

### 2.1 Maven

在项目的 `pom.xml` 文件中添加以下依赖：

```xml
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi-ooxml</artifactId>
    <version>5.2.3</version>
</dependency>
```

### 2.2 Gradle

在项目的 `build.gradle` 文件中添加以下依赖：

```groovy
implementation 'org.apache.poi:poi-ooxml:5.2.3'
```

## 3 基本用法

Apache POI 提供了丰富的 API 来操作不同类型的 Office 文件。以下是一些基本概念：

- **Workbook**: 表示整个 Excel 文件。
- **Sheet**: 表示 Excel 文件中的一个工作表。
- **Row**: 表示工作表中的一行。
- **Cell**: 表示工作表中的一个单元格。

## 4 读写 Excel 文件

### 4.1 创建 Excel 文件

```java
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.FileOutputStream;
import java.io.IOException;

public class ExcelWriter {

    public static void main(String[] args) {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Sheet1");

        Row row = sheet.createRow(0);
        Cell cell = row.createCell(0);
        cell.setCellValue("Hello, Apache POI!");

        try (FileOutputStream outputStream = new FileOutputStream("example.xlsx")) {
            workbook.write(outputStream);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

### 4.2 读取 Excel 文件

```java
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.FileInputStream;
import java.io.IOException;

public class ExcelReader {

    public static void main(String[] args) {
        try (FileInputStream inputStream = new FileInputStream("example.xlsx")) {
            Workbook workbook = new XSSFWorkbook(inputStream);
            Sheet sheet = workbook.getSheetAt(0);

            for (Row row : sheet) {
                for (Cell cell : row) {
                    System.out.print(cell.getStringCellValue() + "\t");
                }
                System.out.println();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

## 5 读写 Word 文件

### 5.1 创建 Word 文件

```java
import org.apache.poi.xwpf.usermodel.*;

import java.io.FileOutputStream;
import java.io.IOException;

public class WordWriter {

    public static void main(String[] args) {
        XWPFDocument document = new XWPFDocument();

        XWPFParagraph paragraph = document.createParagraph();
        XWPFRun run = paragraph.createRun();
        run.setText("Hello, Apache POI!");

        try (FileOutputStream outputStream = new FileOutputStream("example.docx")) {
            document.write(outputStream);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

### 5.2 读取 Word 文件

```java
import org.apache.poi.xwpf.usermodel.*;

import java.io.FileInputStream;
import java.io.IOException;

public class WordReader {

    public static void main(String[] args) {
        try (FileInputStream inputStream = new FileInputStream("example.docx")) {
            XWPFDocument document = new XWPFDocument(inputStream);

            for (XWPFParagraph paragraph : document.getParagraphs()) {
                System.out.println(paragraph.getText());
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

## 6 读写 PowerPoint 文件

### 6.1 创建 PowerPoint 文件

```java
import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.apache.poi.xslf.usermodel.XSLFSlide;
import org.apache.poi.xslf.usermodel.XSLFTextBox;
import org.apache.poi.xslf.usermodel.XSLFTextParagraph;
import org.apache.poi.xslf.usermodel.XSLFTextRun;

import java.io.FileOutputStream;
import java.io.IOException;

public class PowerPointWriter {

    public static void main(String[] args) {
        XMLSlideShow ppt = new XMLSlideShow();
        XSLFSlide slide = ppt.createSlide();

        XSLFTextBox shape = slide.createTextBox();
        XSLFTextParagraph p = shape.addNewTextParagraph();
        XSLFTextRun r = p.addNewTextRun();
        r.setText("Hello, Apache POI!");

        try (FileOutputStream outputStream = new FileOutputStream("example.pptx")) {
            ppt.write(outputStream);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

### 6.2 读取 PowerPoint 文件

```java
import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.apache.poi.xslf.usermodel.XSLFSlide;

import java.io.FileInputStream;
import java.io.IOException;

public class PowerPointReader {

    public static void main(String[] args) {
        try (FileInputStream inputStream = new FileInputStream("example.pptx")) {
            XMLSlideShow ppt = new XMLSlideShow(inputStream);

            for (XSLFSlide slide : ppt.getSlides()) {
                System.out.println(slide.getTitle());
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

## 7 高级功能

Apache POI 还支持许多高级功能，如：

- **样式设置**: 例如字体、颜色、边框等。
- **图片插入**: 在 Excel、Word、PowerPoint 文件中插入图片。
- **表格操作**: 在 Word 文件中创建和操作表格。
- **合并单元格**: 在 Excel 文件中合并单元格。

## 8 示例代码

### 8.1 设置 Excel 单元格样式

```java
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.FileOutputStream;
import java.io.IOException;

public class ExcelStyleExample {

    public static void main(String[] args) {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Sheet1");

        Row row = sheet.createRow(0);
        Cell cell = row.createCell(0);
        cell.setCellValue("Styled Cell");

        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 14);
        style.setFont(font);
        cell.setCellStyle(style);

        try (FileOutputStream outputStream = new FileOutputStream("styled_example.xlsx")) {
            workbook.write(outputStream);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

## 9 常见问题

### 9.1 如何处理大文件？

处理大文件时，可以使用 `SXSSFWorkbook` 来减少内存消耗。`SXSSFWorkbook` 是 `XSSFWorkbook` 的流式写法，适合处理大数据量的 Excel 文件。

### 9.2 如何设置自动换行？

可以通过 `CellStyle` 设置自动换行：

```java
CellStyle style = workbook.createCellStyle();
style.setWrapText(true);
cell.setCellStyle(style);
```

### 9.3 如何合并单元格？

可以使用 `sheet.addMergedRegion` 方法来合并单元格：

```java
sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 1));
```
